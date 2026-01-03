Here is the **Full Implementation Plan** to merge Phase 1 and Phase 2 into the final **AstraVerify Demo**.

We will upgrade the architecture to include a **JSON Database** (simplest persistence) so that when you generate a proof, it creates a permanent "Verified Profile" page accessible via QR Code.

---

## 1. Directory Structure Setup

You currently have two folders. We will merge them into one master directory: **`astra-demo`**.

1.  **Create the Folder:**
    ```bash
    mkdir astra-demo
    cd astra-demo
    ```
2.  **Move Phase 1 (Frontend/Server) contents here.** (Your `app`, `package.json`, `verification-server.js`).
3.  **Move Phase 2 Artifacts:**
    *   Create a folder named `circuits/` in the root.
    *   Copy `circuit.wasm` and `circuit_0000.zkey` (from Phase 1) into it.
    *   Copy `verification_key.json` (from Phase 2/zkVerify repo) into it.
    *   *Critical:* Ensure all 3 files are in `astra-demo/circuits/`.

---

## 2. Installation (Dependencies)

We need to add the blockchain SDK and QR code generator to your existing Phase 1 setup.

```bash
npm install zkverifyjs dotenv qrcode.react lowdb
```
*   `zkverifyjs`: To talk to the blockchain.
*   `qrcode.react`: To show the QR on the frontend.
*   `lowdb`: A tiny, zero-setup JSON database to save results.

---

## 3. Step 1: The Backend (Merge Logic)

We will modify `verification-server.js` to:
1.  Scrape (Phase 1).
2.  Prove (Phase 1).
3.  **Settle on zkVerify** (Phase 2).
4.  **Save to Database** (New).

**File:** `verification-server.js` (Replace completely)

```javascript
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
// We use a simple JSON file to simulate a DB. 
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
    wasm: path.join(basePath, 'circuit.wasm'), // Ensure this exists!
    zkey: path.join(basePath, 'circuit_0000.zkey'), // Ensure this exists!
    vk: JSON.parse(fs.readFileSync(path.join(basePath, 'verification_key.json'), 'utf-8'))
  };
};

io.on('connection', (socket) => {
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
      await page.goto('https://wsdc.nitw.ac.in/login');
      
      // Type Credentials (Visual Effect)
      await new Promise(r => setTimeout(r, 1000));
      await page.type('#username', credentials.username, { delay: 50 }); // Update selector if needed
      await page.type('#password', credentials.password, { delay: 50 }); // Update selector if needed
      
      socket.emit('log', '🔐 Logging In...');
      await page.click('#login-btn'); // Update selector if needed
      await page.waitForNavigation({ waitUntil: 'networkidle0' });

      // Scrape Results
      socket.emit('log', '📂 extracting Academic Record...');
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
          .Testnet()
          .withAccount(process.env.ZKV_SEED_PHRASE);

        const { transactionResult } = await session.verify()
          .groth16(Library.snarkjs, CurveType.bn254)
          .waitForPublishedAttestation()
          .execute({
            proofData: {
              vk: artifacts.vk,
              proof: proof,
              publicSignals: publicSignals
            }
          });

        const { transactionHash, attestationId } = await transactionResult;
        socket.emit('log', `🎉 Block Confirmed! Tx: ${transactionHash.slice(0,10)}...`);

        // 4. SAVE & FINISH
        const recordId = Math.random().toString(36).substr(2, 9); // Simple ID
        
        saveVerification({
          id: recordId,
          username: credentials.username,
          cgpa: cgpa,
          txHash: transactionHash,
          attestationId: attestationId,
          timestamp: new Date().toISOString()
        });

        socket.emit('verification_complete', {
          recordId: recordId,
          txHash: transactionHash
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

server.listen(PORT, () => console.log(`Engine running on ${PORT}`));
```

---

## 4. Step 2: Create the "Verified Badge" Page

We need a public page that employers see when they scan the QR code. This page reads from `db.json` to show the verification status.

**File:** `src/app/verify/[id]/page.tsx` (Create folders if needed)

```tsx
import fs from 'fs';
import path from 'path';

// Server Component (Reads DB directly)
export default async function VerifiedPage({ params }: { params: { id: string } }) {
  const dbPath = path.join(process.cwd(), 'db.json');
  let record = null;

  try {
    if (fs.existsSync(dbPath)) {
      const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      record = data.find((r: any) => r.id === params.id);
    }
  } catch (e) {
    console.error("DB Read Error", e);
  }

  if (!record) {
    return <div className="p-10 text-red-500 font-bold text-center">Record Not Found</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full border-t-8 border-green-500">
        
        {/* GREEN BADGE */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 text-green-600 rounded-full p-4">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">Verified Student</h1>
        <p className="text-center text-slate-500 mb-8">NIT Warangal • Class of 2024</p>

        <div className="space-y-4">
          <div className="flex justify-between border-b pb-2">
            <span className="text-slate-500">Candidate</span>
            <span className="font-mono font-bold">{record.username}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-slate-500">CGPA Verified</span>
            <span className="font-bold text-green-600">{record.cgpa} &gt; 6.0</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-slate-500">Attestation Date</span>
            <span className="text-sm">{new Date(record.timestamp).toLocaleDateString()}</span>
          </div>
        </div>

        {/* GREEN LINK TO BLOCKCHAIN */}
        <div className="mt-8">
          <a 
            href={`https://zkverify-testnet.subscan.io/extrinsic/${record.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-700 transition-all font-mono text-sm"
          >
            View On-Chain Proof ↗
          </a>
          <p className="text-[10px] text-center mt-2 text-slate-400">
            Tx: {record.txHash.slice(0, 20)}...
          </p>
        </div>
      </div>
      
      <div className="mt-8 flex items-center gap-2 text-slate-400">
        <span className="font-bold">AstraVerify</span> Security Layer
      </div>
    </div>
  );
}
```

---

## 5. Step 3: Update Main UI (Frontend)

Update the main dashboard to show the **QR Code** upon success.

**File:** `src/app/page.tsx`

```tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react'; // Import QR Generator

export default function LiveVerifier() {
  // ... [Keep existing state/refs] ...
  const [result, setResult] = useState<{ recordId: string, txHash: string } | null>(null);

  // ... [Keep existing useEffect, socket connection, canvas logic] ...

  // UPDATE: Handle new verification_complete event
  useEffect(() => {
    // ... setup socket ...
    
    socket.on('verification_complete', (data) => {
      setResult(data); // Save the ID and Hash
      setStatus('✅ Proof Settled & Identity Minted!');
    });

    // ... cleanup ...
  }, []);

  // ... [Keep existing helper functions] ...

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-8 font-mono flex gap-8">
      
      {/* LEFT PANEL */}
      <div className="w-1/3 flex flex-col gap-6">
        {/* ... [Keep Title and Logs] ... */}

        {/* CONDITIONALLY RENDER: FORM vs RESULT */}
        {!result ? (
          <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
             {/* ... [Existing Inputs & Button] ... */}
          </div>
        ) : (
          // SUCCESS STATE: SHOW QR CODE
          <div className="bg-green-900/20 border border-green-500 p-6 rounded-lg flex flex-col items-center animate-fade-in">
            <h2 className="text-xl font-bold text-green-400 mb-4">Identity Verified</h2>
            
            <div className="bg-white p-4 rounded-lg mb-4">
              <QRCodeSVG 
                value={`${window.location.origin}/verify/${result.recordId}`} 
                size={150} 
              />
            </div>

            <p className="text-xs text-center text-green-300 mb-4">
              Scan to view Verified Profile
            </p>

            <a 
              href={`/verify/${result.recordId}`}
              target="_blank"
              className="bg-green-600 text-white py-2 px-4 rounded text-sm hover:bg-green-500 w-full text-center"
            >
              Open Profile Page ↗
            </a>
          </div>
        )}
      </div>

      {/* RIGHT PANEL (Keep existing Canvas) */}
      <div className="w-2/3 flex flex-col gap-6">
         {/* ... [Canvas] ... */}
      </div>

    </main>
  );
}
```

---

## 6. Final Execution

1.  **Configure `.env`**: Add `ZKV_SEED_PHRASE`.
2.  **Start Backend**: `node verification-server.js` (Running on 4000).
3.  **Start Frontend**: `npm run dev` (Running on 3000).
4.  **Demo Flow:**
    *   Open `localhost:3000`.
    *   Enter Credentials -> "Verify".
    *   Watch the screen scrape (Phase 1).
    *   Wait for "Submitting to zkVerify Chain..." (Phase 2).
    *   **Success:** Form disappears, **QR Code Appears**.
    *   **Action:** Click "Open Profile Page" (or scan with phone).
    *   **Result:** You see the "Verified Student" Badge with the Green Link to the blockchain transaction.

This is the complete, integrated AstraVerify PoC.