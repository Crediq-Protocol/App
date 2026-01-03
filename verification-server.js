require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const puppeteer = require('puppeteer');
const snarkjs = require('snarkjs');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { zkVerifySession, Library, CurveType } = require('zkverifyjs');

// --- DATABASE SETUP (JSON File) ---
const DB_FILE = path.join(__dirname, 'db.json');
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify([]));

function saveVerification(record) {
  const data = JSON.parse(fs.readFileSync(DB_FILE));
  data.push(record);
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// --- SERVER SETUP ---
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const PORT = 4000;

// Helper: Load ZK Artifacts
const loadArtifacts = () => {
  const basePath = path.join(__dirname, 'circuits');
  return {
    wasm: path.join(basePath, 'circuit_js', 'circuit.wasm'),
    zkey: path.join(basePath, 'circuit_0000.zkey'),
    vk: JSON.parse(fs.readFileSync(path.join(basePath, 'verification_key.json'), 'utf-8'))
  };
};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('start_verification', async (credentials) => {
    let browser = null;
    try {
      socket.emit('log', '🚀 Initializing Secure Session...');

      // 1. LAUNCH BROWSER (CDP STREAM)
      browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--window-size=1280,720']
      });
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 720 });

      // CDP Screencast Logic
      const cdp = await page.createCDPSession();
      await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 80, maxWidth: 640 });
      cdp.on('Page.screencastFrame', ({ data, sessionId }) => {
        socket.emit('screencast_frame', data);
        cdp.send('Page.screencastFrameAck', { sessionId });
      });

      // 2. NAVIGATE & SCRAPE (Phase 1 Logic)
      socket.emit('log', '🌍 Navigating to NITW Portal...');
      await page.goto('https://wsdc.nitw.ac.in');

      // Visual delay for demo effect
      await new Promise(r => setTimeout(r, 1500));

      socket.emit('log', '🔐 Inputting Credentials...');
      await page.type('#login input[name="username"]', credentials.username, { delay: 50 });
      await page.type('#login input[name="passw"]', credentials.password, { delay: 50 });

      socket.emit('log', '🖱️ Clicking Login...');
      await page.click('#login input[type="submit"]');

      // Wait for navigation with fallback (some portals use AJAX)
      try {
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 });
      } catch (e) {
        // Navigation may have completed quickly or is AJAX-based, continue
        socket.emit('log', '⏳ Waiting for page to settle...');
        await new Promise(r => setTimeout(r, 3000));
      }

      // Scrape Results
      socket.emit('log', '📂 Accessing Results Page...');
      await page.goto('https://wsdc.nitw.ac.in/results/');

      const cgpaText = await page.evaluate(() => {
        const body = document.body.innerText;
        const match = body.match(/Cumulative Grade Point Average \(CGPA\):\s*([\d.]+)/);
        return match ? match[1] : null;
      });

      if (!cgpaText) throw new Error("CGPA not found");
      const cgpa = parseFloat(cgpaText);
      socket.emit('log', `✅ Found CGPA: ${cgpa}`);

      // 3. GENERATE PROOF & SETTLE (Phase 2 Logic)
      if (cgpa > 6.0) {
        socket.emit('log', '⚡ Generating ZK Proof...');
        const artifacts = loadArtifacts();

        // A. Generate Proof (Local)
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
          { a: 6, b: 7 }, // Dummy circuit logic
          artifacts.wasm,
          artifacts.zkey
        );

        // B. Submit to zkVerify (Blockchain)
        socket.emit('log', '⛓️ Submitting to zkVerify Chain...');

        const session = await zkVerifySession.start()
          .Volta()  // Use Volta testnet (v2.x API)
          .withAccount(process.env.ZKV_SEED_PHRASE);

        const { transactionResult } = await session.verify()
          .groth16({
            library: Library.snarkjs,
            curve: CurveType.bn254
          })
          .execute({
            proofData: {
              vk: artifacts.vk,
              proof: proof,
              publicSignals: publicSignals
            }
          });

        socket.emit('log', '⏳ Waiting for block finality...');
        const result = await transactionResult;
        const txHash = result.txHash;
        const attestationId = result.attestationId || result.statementHash || 'pending';
        socket.emit('log', `🎉 Block Confirmed! Tx: ${txHash.slice(0, 10)}...`);

        // 4. SAVE & FINISH
        const recordId = Math.random().toString(36).substr(2, 9);

        saveVerification({
          id: recordId,
          username: credentials.username,
          cgpa: cgpa,
          txHash: txHash,
          attestationId: attestationId,
          timestamp: new Date().toISOString()
        });

        socket.emit('verification_complete', {
          recordId: recordId,
          txHash: txHash
        });

      } else {
        throw new Error("CGPA too low.");
      }

    } catch (error) {
      console.error(error);
      socket.emit('error', error.message);
    } finally {
      if (browser) await browser.close();
    }
  });
});

server.listen(PORT, () => console.log(`Verification Engine running on port ${PORT}`));
