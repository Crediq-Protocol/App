require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const puppeteer = require('puppeteer');
const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const snarkjs = require('snarkjs');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { zkVerifySession, Library, CurveType } = require('zkverifyjs');

// Configure stealth plugin for LeetCode
puppeteerExtra.use(StealthPlugin());

// --- DATABASE SETUP (Firestore) ---
const { db } = require('./lib/firebase-admin');

async function saveVerification(record) {
  if (!db) {
    console.warn('⚠️ Firestore not available, skipping save');
    return;
  }
  try {
    await db.collection('verifications').doc(record.id).set(record);
    console.log(`✅ Verification saved to Firestore: ${record.id}`);
  } catch (error) {
    console.error('❌ Failed to save to Firestore:', error.message);
  }
}

// --- SERVER SETUP ---
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const PORT = process.env.PORT || 4000;

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

  socket.on('start_verification', async (data) => {
    const { credentials, firebaseUid } = data;
    let browser = null;
    try {
      socket.emit('log', '🚀 Initializing Secure Session...');

      // 1. LAUNCH BROWSER (CDP STREAM)
      browser = await puppeteer.launch({
        headless: "new",
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--window-size=1280,720'
        ]
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
      const CLAIM_THRESHOLD = 6.0;
      const claimResult = cgpa > CLAIM_THRESHOLD;

      if (claimResult) {
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

        // 4. SAVE & FINISH (Enhanced Schema)
        const recordId = Math.random().toString(36).substr(2, 9);

        await saveVerification({
          id: recordId,
          firebaseUid: firebaseUid || null,
          username: credentials.username,
          verificationType: 'nitw_cgpa',
          claimThreshold: CLAIM_THRESHOLD,
          claimResult: claimResult,
          cgpa: cgpa,
          txHash: txHash,
          attestationId: attestationId,
          status: 'verified',
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

  // =============================================
  // LEETCODE VERIFICATION (Public Profile)
  // =============================================
  socket.on('start_leetcode_verification', async (data) => {
    const { username, firebaseUid } = data;
    let browser = null;

    try {
      socket.emit('log', '🚀 Initializing LeetCode Session (Stealth Mode)...');

      // 1. Launch browser with STEALTH plugin to bypass Cloudflare
      browser = await puppeteerExtra.launch({
        headless: "new",
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage', // Memory optimization
          '--disable-acceleration',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--disable-blink-features=AutomationControlled',
          '--window-size=1280,720'
        ]
      });
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 720 });

      // Set realistic user agent
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      // CDP Screencast
      const cdp = await page.createCDPSession();
      await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 80, maxWidth: 640 });
      cdp.on('Page.screencastFrame', ({ data: frameData, sessionId }) => {
        socket.emit('screencast_frame', frameData);
        cdp.send('Page.screencastFrameAck', { sessionId });
      });

      // 2. Navigate to LeetCode profile
      socket.emit('log', '🌍 Navigating to LeetCode Profile...');
      await page.goto(`https://leetcode.com/u/${username}/`, {
        waitUntil: 'networkidle2',
        timeout: 45000
      });

      // Wait longer for Cloudflare challenge to pass and React to hydrate
      socket.emit('log', '⏳ Waiting for page to load...');
      await new Promise(r => setTimeout(r, 5000));

      // Check if we're stuck on Cloudflare challenge
      const pageUrl = page.url();
      const pageTitle = await page.title();

      // If still on challenge, wait more
      if (pageTitle.toLowerCase().includes('just a moment') || pageUrl.includes('challenge')) {
        socket.emit('log', '🔄 Bypassing security check...');
        await new Promise(r => setTimeout(r, 5000));
      }

      // Now check for actual LeetCode 404 (look for specific elements)
      const is404 = await page.evaluate(() => {
        // LeetCode shows a specific 404 page with "Page Not Found" heading
        const h1 = document.querySelector('h1');
        if (h1 && h1.innerText.includes('Page Not Found')) return true;

        // Also check if we see username/profile elements (means profile exists)
        const hasProfileData = document.body.innerText.includes('Solved') ||
          document.body.innerText.includes('Rank') ||
          document.body.innerText.includes('submissions');
        if (hasProfileData) return false;

        // If page is mostly empty or has error, it might be blocked
        return document.body.innerText.length < 500;
      });

      if (is404) {
        throw new Error(`Profile "${username}" not found or page blocked`);
      }

      // 3. Scrape stats
      socket.emit('log', '📊 Reading Profile Stats...');

      const stats = await page.evaluate(() => {
        const text = document.body.innerText;

        // Try multiple patterns for solved count
        // Pattern 1: "X/Y Solved" format
        let solvedMatch = text.match(/(\d+)\s*\/\s*\d+\s*Solved/i);
        // Pattern 2: Text near "Solved" 
        if (!solvedMatch) {
          solvedMatch = text.match(/Solved\s*(\d+)/i);
        }
        // Pattern 3: Look for total in stats section
        if (!solvedMatch) {
          const totalMatch = text.match(/(\d+)\s*Solved/i);
          solvedMatch = totalMatch;
        }

        // Get breakdown
        const easyMatch = text.match(/Easy\s*(\d+)/i);
        const mediumMatch = text.match(/Medium\s*(\d+)/i);
        const hardMatch = text.match(/Hard\s*(\d+)/i);

        // Calculate total from breakdown if main match failed
        let totalSolved = solvedMatch ? parseInt(solvedMatch[1]) : null;
        if (!totalSolved && (easyMatch || mediumMatch || hardMatch)) {
          totalSolved = (easyMatch ? parseInt(easyMatch[1]) : 0) +
            (mediumMatch ? parseInt(mediumMatch[1]) : 0) +
            (hardMatch ? parseInt(hardMatch[1]) : 0);
        }

        return {
          totalSolved: totalSolved,
          easy: easyMatch ? parseInt(easyMatch[1]) : 0,
          medium: mediumMatch ? parseInt(mediumMatch[1]) : 0,
          hard: hardMatch ? parseInt(hardMatch[1]) : 0
        };
      });

      if (stats.totalSolved === null) {
        throw new Error('Could not find solved count on profile. Is the profile public?');
      }

      socket.emit('log', `✅ Found: ${stats.totalSolved} problems solved (E:${stats.easy} M:${stats.medium} H:${stats.hard})`);

      // 4. Threshold check
      const CLAIM_THRESHOLD = 5;
      const claimResult = stats.totalSolved >= CLAIM_THRESHOLD;

      if (!claimResult) {
        throw new Error(`Only ${stats.totalSolved} problems solved (need ${CLAIM_THRESHOLD}+)`);
      }

      // 5. Generate ZK Proof
      socket.emit('log', '⚡ Generating ZK Proof...');
      const artifacts = loadArtifacts();
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        { a: 6, b: 7 },
        artifacts.wasm,
        artifacts.zkey
      );

      // 6. Submit to zkVerify
      socket.emit('log', '⛓️ Submitting to zkVerify Chain...');
      const session = await zkVerifySession.start()
        .Volta()
        .withAccount(process.env.ZKV_SEED_PHRASE);

      const { transactionResult } = await session.verify()
        .groth16({ library: Library.snarkjs, curve: CurveType.bn254 })
        .execute({ proofData: { vk: artifacts.vk, proof, publicSignals } });

      socket.emit('log', '⏳ Waiting for block finality...');
      const result = await transactionResult;
      const txHash = result.txHash;
      const attestationId = result.attestationId || result.statementHash || 'pending';

      socket.emit('log', `🎉 Block Confirmed! Tx: ${txHash.slice(0, 10)}...`);

      // 7. Save to Firestore
      const recordId = Math.random().toString(36).substr(2, 9);
      await saveVerification({
        id: recordId,
        firebaseUid: firebaseUid || null,
        username: username,
        verificationType: 'leetcode_solved',
        claimThreshold: CLAIM_THRESHOLD,
        claimResult: claimResult,
        totalSolved: stats.totalSolved,
        breakdown: { easy: stats.easy, medium: stats.medium, hard: stats.hard },
        txHash: txHash,
        attestationId: attestationId,
        status: 'verified',
        timestamp: new Date().toISOString()
      });

      socket.emit('verification_complete', { recordId, txHash });

    } catch (error) {
      console.error(error);
      socket.emit('error', error.message);
    } finally {
      if (browser) await browser.close();
    }
  });
});

server.listen(PORT, () => console.log(`Verification Engine running on port ${PORT}`));
