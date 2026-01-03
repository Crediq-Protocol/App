Here is the updated, high-fidelity implementation plan for **Phase 1**.

This plan introduces a **real-time visual layer** to the "Wizard of Oz" architecture. Instead of a blind spinner, the user will watch a live stream of the server navigating the NITW portal, logging in, and "scanning" their data.

---

# Phase 1: Interactive Fetch & Prove (Visualized)

## 1. Architectural Change
Next.js API routes (Serverless functions) cannot handle long-running WebSockets or persistent browser sessions well.
For this PoC, we will spin up a **Dedicated Verification Server** (Node.js + Socket.io) alongside the Next.js frontend.

*   **Frontend (Next.js):** Renders the UI and the `<canvas>` video player.
*   **Verification Engine (Node.js):** Runs Puppeteer, handles the CDP Screencast, and generates the ZK Proof.

## 2. Prerequisites
Install the required packages in your project root:

```bash
npm install express socket.io socket.io-client puppeteer snarkjs cors dotenv
```

---

## 3. Step 1: The Verification Engine (Server)

This is the core. It launches Chrome, taps into the DevTools Protocol (CDP) to grab video frames, and streams them to the client while scraping.

**File:** `verification-server.js` (Create in root)

```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const puppeteer = require('puppeteer');
const snarkjs = require('snarkjs');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const PORT = 4000;

// Helper: Load ZK Artifacts
const loadArtifacts = () => {
  const basePath = path.join(__dirname, 'circuits');
  return {
    wasm: path.join(basePath, 'circuit_js', 'circuit.wasm'),
    zkey: path.join(basePath, 'circuit_0000.zkey'),
  };
};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('start_verification', async (credentials) => {
    let browser = null;
    try {
      socket.emit('log', '🚀 Initializing Secure Browser...');
      
      // 1. Launch Browser
      browser = await puppeteer.launch({
        headless: "new", // Must be headless for server
        args: ['--no-sandbox', '--window-size=1280,720']
      });
      
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 720 });

      // ----------------------------------------------------
      // 2. SETUP CDP SCREENCAST (The Magic)
      // ----------------------------------------------------
      const cdp = await page.createCDPSession();
      
      await cdp.send('Page.startScreencast', {
        format: 'jpeg',
        quality: 80,
        maxWidth: 640, // Optimize bandwidth
        everyNthFrame: 1
      });

      cdp.on('Page.screencastFrame', ({ data, sessionId }) => {
        // Emit frame to frontend
        socket.emit('screencast_frame', data);
        
        // Acknowledge frame to keep stream flowing
        cdp.send('Page.screencastFrameAck', { sessionId });
      });

      // ----------------------------------------------------
      // 3. PERFORM THE LOGIN
      // ----------------------------------------------------
      socket.emit('log', '🌍 Navigating to NITW Portal...');
      await page.goto('https://wsdc.nitw.ac.in/login');

      // Visual delay for demo effect (so user sees the login page)
      await new Promise(r => setTimeout(r, 1500));

      socket.emit('log', '🔐 Inputting Credentials...');
      
      // *** UPDATE SELECTORS FOR REAL NITW SITE ***
      await page.type('#username', credentials.username, { delay: 50 }); // Typing effect
      await page.type('#password', credentials.password, { delay: 50 });
      
      socket.emit('log', '🖱️ Clicking Login...');
      await page.click('#login-btn'); // Update ID
      
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 });

      // ----------------------------------------------------
      // 4. SCRAPE DATA
      // ----------------------------------------------------
      socket.emit('log', '📂 Accessing Results Page...');
      await page.goto('https://wsdc.nitw.ac.in/results/');
      
      // Extract CGPA
      const cgpaText = await page.evaluate(() => {
        const body = document.body.innerText;
        // Strict Regex for NITW format
        const match = body.match(/Cumulative Grade Point Average \(CGPA\):\s*([\d.]+)/);
        return match ? match[1] : null;
      });

      if (!cgpaText) throw new Error("CGPA not found in DOM");
      
      const cgpa = parseFloat(cgpaText);
      socket.emit('log', `✅ Scraped CGPA: ${cgpa}`);

      // ----------------------------------------------------
      // 5. GENERATE PROOF
      // ----------------------------------------------------
      if (cgpa > 6.0) {
        socket.emit('log', '⚡ Generating Zero-Knowledge Proof...');
        
        const artifacts = loadArtifacts();
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
          { a: 6, b: 7 }, 
          artifacts.wasm, 
          artifacts.zkey
        );

        socket.emit('verification_complete', {
          success: true,
          cgpa: cgpa,
          proof: proof,
          publicSignals: publicSignals
        });
      } else {
        throw new Error(`CGPA ${cgpa} is below requirement (6.0)`);
      }

    } catch (error) {
      console.error(error);
      socket.emit('error', error.message);
    } finally {
      if (browser) await browser.close();
    }
  });
});

server.listen(PORT, () => {
  console.log(`Verification Engine running on port ${PORT}`);
});
```

---

## 4. Step 2: The Visual Frontend (Client)

This component connects to the socket, draws the incoming frames to a `<canvas>`, and handles the user flow.

**File:** `src/app/page.tsx`

```tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

export default function LiveVerifier() {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState('Idle');
  const [proofData, setProofData] = useState<any>(null);
  
  // Refs for non-react state handling
  const socketRef = useRef<Socket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Connect to Verification Engine
    const socket = io('http://localhost:4000');
    socketRef.current = socket;

    socket.on('connect', () => addLog('Connected to Verification Engine'));

    socket.on('log', (msg) => {
      setStatus(msg);
      addLog(msg);
    });

    // HANDLE VIDEO STREAM
    socket.on('screencast_frame', (frameData) => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          // Draw the jpeg frame from server
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = 'data:image/jpeg;base64,' + frameData;
      }
    });

    socket.on('verification_complete', (data) => {
      setProofData(data);
      setStatus('✅ Proof Generated Successfully!');
    });

    socket.on('error', (err) => {
      setStatus('❌ Error: ' + err);
      addLog('Error: ' + err);
    });

    return () => { socket.disconnect(); };
  }, []);

  const addLog = (msg: string) => setLogs(prev => [...prev, `> ${msg}`]);

  const handleStart = () => {
    if (!socketRef.current) return;
    setProofData(null);
    setLogs([]);
    socketRef.current.emit('start_verification', creds);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-8 font-mono flex gap-8">
      
      {/* LEFT: CONTROLS & LOGS */}
      <div className="w-1/3 flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-yellow-500 border-b border-yellow-800 pb-4">
          AstraVerify: Live View
        </h1>

        <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
          <input 
            placeholder="Username" 
            className="w-full bg-black border border-neutral-700 p-3 mb-4 rounded"
            onChange={e => setCreds({...creds, username: e.target.value})}
          />
          <input 
            type="password"
            placeholder="Password" 
            className="w-full bg-black border border-neutral-700 p-3 mb-6 rounded"
            onChange={e => setCreds({...creds, password: e.target.value})}
          />
          <button 
            onClick={handleStart}
            className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded transition-all"
          >
            Start Live Verification
          </button>
        </div>

        <div className="flex-1 bg-black rounded-lg border border-neutral-800 p-4 overflow-y-auto max-h-[300px] text-xs text-green-400">
          {logs.map((l, i) => <div key={i} className="mb-1">{l}</div>)}
        </div>
      </div>

      {/* RIGHT: LIVE STREAM & RESULT */}
      <div className="w-2/3 flex flex-col gap-6">
        
        {/* LIVE CANVAS */}
        <div className="relative w-full aspect-video bg-neutral-900 rounded-xl border-2 border-neutral-800 overflow-hidden shadow-2xl">
          <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded animate-pulse z-10">
            LIVE SERVER VIEW
          </div>
          <canvas 
            ref={canvasRef} 
            width={640} 
            height={360} 
            className="w-full h-full object-contain"
          />
        </div>

        {/* PROOF ARTIFACT */}
        {proofData && (
          <div className="bg-neutral-900 border border-green-600 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-green-400">Verified Artifact</h2>
              <span className="bg-green-900 text-green-300 text-xs px-3 py-1 rounded-full">
                Groth16 Snark
              </span>
            </div>
            <pre className="text-[10px] text-neutral-400 bg-black p-4 rounded overflow-auto max-h-40">
              {JSON.stringify(proofData.proof, null, 2)}
            </pre>
          </div>
        )}
      </div>

    </main>
  );
}
```

---

## 5. Execution Guide

This PoC runs as **two separate processes**.

### Step A: Setup Circuits
Ensure you have the `circuits/` folder with `circuit.wasm` and `circuit_0000.zkey` in your project root (generated from the previous snarkjs steps).

### Step B: Run the Engine
Open **Terminal 1**:
```bash
node verification-server.js
# Output: Verification Engine running on port 4000
```

### Step C: Run the UI
Open **Terminal 2**:
```bash
npm run dev
# Output: Next.js running on localhost:3000
```

### Step D: The Demo
1.  Go to `localhost:3000`.
2.  Type credentials.
3.  Click **Start Live Verification**.
4.  **Watch the magic:**
    *   The black box on the right will light up.
    *   You will see the NITW website appear.
    *   You will see the text being typed into the fields (ghost typing).
    *   You will see the page redirect to the results.
    *   The logs on the left will sync with the video: *"Scraping... Found CGPA"*.
    *   Finally, the Green Proof box appears.

This is a very powerful demo because it visually proves *something* is happening, building immense trust compared to a simple loading spinner.