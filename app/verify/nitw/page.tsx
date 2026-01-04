'use client';
import { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import { auth } from '@/app/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface VerificationResult {
    recordId: string;
    txHash: string;
}

export default function NITWVerifier() {
    const [user, setUser] = useState<User | null>(null);
    const [creds, setCreds] = useState({ username: '', password: '' });
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState('Idle');
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const socketRef = useRef<Socket | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Track auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const socket = io('http://localhost:4000');
        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            addLog('Connected to verification engine');
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            addLog('Disconnected from verification engine');
        });

        socket.on('log', (msg: string) => {
            // Strip emojis from server logs
            const cleanMsg = msg.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu, '').trim();
            setStatus(cleanMsg);
            addLog(cleanMsg);
        });

        socket.on('screencast_frame', (frameData: string) => {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                const img = new Image();
                img.onload = () => {
                    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                };
                img.src = 'data:image/jpeg;base64,' + frameData;
            }
        });

        socket.on('verification_complete', (data: VerificationResult) => {
            setResult(data);
            setStatus('Verified');
            setIsVerifying(false);
            addLog('Verification complete. Proof settled on chain.');
        });

        socket.on('error', (err: string) => {
            setStatus('Error: ' + err);
            setIsVerifying(false);
            addLog('Error: ' + err);
        });

        return () => { socket.disconnect(); };
    }, []);

    const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    const handleStart = () => {
        if (!socketRef.current || !creds.username || !creds.password) return;
        setResult(null);
        setLogs([]);
        setIsVerifying(true);
        setStatus('Starting verification...');

        // Send credentials along with Firebase UID for tracking
        const firebaseUid = user?.uid || null;
        console.log('Sending firebaseUid:', firebaseUid); // Debug log
        socketRef.current.emit('start_verification', {
            credentials: creds,
            firebaseUid: firebaseUid
        });
    };


    return (
        <main className="min-h-screen bg-stone-100 text-slate-900 p-8 font-sans">
            {/* Back Button */}
            <button
                onClick={() => window.location.href = '/dashboard'}
                className="mb-6 text-sm text-slate-500 hover:text-slate-700 flex items-center gap-2 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back to Dashboard
            </button>

            <div className="flex gap-8">
                {/* LEFT: CONTROLS & LOGS */}
                <div className="w-1/3 flex flex-col gap-5">
                    <div>
                        <h1 className="text-xl font-semibold mb-1">Verify CGPA</h1>
                        <p className="text-sm text-slate-500 pb-4 border-b border-slate-200">
                            NIT Warangal Portal
                        </p>
                    </div>

                    {/* Connection Status */}
                    <div className="text-xs text-slate-500">
                        Status: {isConnected ? 'Connected' : 'Disconnected'}
                    </div>

                    {!result ? (
                        <div className="bg-white border border-slate-200 p-5 rounded">
                            <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Portal Credentials</label>
                            <input
                                placeholder="Registration Number"
                                className="w-full bg-stone-50 border border-slate-200 p-3 mb-3 rounded text-sm focus:border-slate-400 focus:outline-none transition-colors"
                                value={creds.username}
                                onChange={e => setCreds({ ...creds, username: e.target.value })}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full bg-stone-50 border border-slate-200 p-3 mb-5 rounded text-sm focus:border-slate-400 focus:outline-none transition-colors"
                                value={creds.password}
                                onChange={e => setCreds({ ...creds, password: e.target.value })}
                            />
                            <button
                                onClick={handleStart}
                                disabled={!isConnected || isVerifying || !creds.username || !creds.password}
                                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white disabled:text-slate-500 font-medium py-3 rounded transition-colors text-sm"
                            >
                                {isVerifying ? 'Verifying...' : 'Start Verification'}
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-200 p-5 rounded">
                            <h2 className="text-sm font-medium text-slate-900 mb-4">Verified</h2>

                            <div className="bg-slate-50 p-4 rounded mb-4 flex justify-center">
                                <QRCodeSVG
                                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${result.recordId}`}
                                    size={120}
                                />
                            </div>

                            <p className="text-xs text-center text-slate-500 mb-4">
                                Scan to view verified profile
                            </p>

                            <a
                                href={`/verify/${result.recordId}`}
                                target="_blank"
                                className="block w-full text-center bg-slate-900 text-white py-2 rounded text-sm hover:bg-slate-800 transition-colors mb-3"
                            >
                                Open Profile
                            </a>

                            <a
                                href={`https://zkverify-testnet.subscan.io/extrinsic/${result.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-xs text-center text-slate-500 hover:text-slate-700 transition-colors font-mono"
                            >
                                Tx: {result.txHash.slice(0, 24)}...
                            </a>
                        </div>
                    )}

                    {/* STATUS */}
                    <div className="bg-white border border-slate-200 rounded p-4">
                        <label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">Current Status</label>
                        <p className="text-sm text-slate-700">{status}</p>
                    </div>

                    {/* LOGS */}
                    <div className="flex-1 bg-white border border-slate-200 rounded p-4 overflow-y-auto max-h-[250px]">
                        <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Activity Log</label>
                        <div className="text-xs text-slate-600 space-y-1 font-mono">
                            {logs.length === 0 ? (
                                <span className="text-slate-400">Waiting for verification...</span>
                            ) : (
                                logs.map((l, i) => <div key={i}>{l}</div>)
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: SESSION VIEW */}
                <div className="w-2/3 flex flex-col gap-5">
                    <div className="relative w-full aspect-video bg-white border border-slate-200 rounded overflow-hidden">
                        {isVerifying && (
                            <div className="absolute top-3 left-3 bg-slate-700 text-white text-[10px] font-medium px-2 py-1 rounded z-10">
                                Session active
                            </div>
                        )}
                        {!isVerifying && !result && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center text-slate-400">
                                    <p className="text-sm">Enter credentials to begin verification</p>
                                    <p className="text-xs mt-1">Session view will appear here</p>
                                </div>
                            </div>
                        )}
                        {result && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                                <div className="text-center">
                                    <p className="text-sm font-medium text-slate-700">Verification Complete</p>
                                    <p className="text-xs mt-1 text-slate-500">Proof settled on chain</p>
                                </div>
                            </div>
                        )}
                        <canvas
                            ref={canvasRef}
                            width={640}
                            height={360}
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
