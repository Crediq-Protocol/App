'use client';
import { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';

interface VerificationResult {
    recordId: string;
    txHash: string;
}

export default function NITWVerifier() {
    const [creds, setCreds] = useState({ username: '', password: '' });
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState('Idle');
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const socketRef = useRef<Socket | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const socket = io('http://localhost:4000');
        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            addLog('🔗 Connected to Verification Engine');
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            addLog('❌ Disconnected from Verification Engine');
        });

        socket.on('log', (msg: string) => {
            setStatus(msg);
            addLog(msg);
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
            setStatus('✅ Proof Settled & Identity Minted!');
            setIsVerifying(false);
            addLog('🎉 Verification complete! Proof settled on zkVerify chain.');
        });

        socket.on('error', (err: string) => {
            setStatus('❌ Error: ' + err);
            setIsVerifying(false);
            addLog('❌ Error: ' + err);
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
        socketRef.current.emit('start_verification', creds);
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white p-8 font-sans">
            {/* Back Button */}
            <button
                onClick={() => window.location.href = '/dashboard'}
                className="mb-6 text-sm text-slate-500 hover:text-white flex items-center gap-2 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back to Dashboard
            </button>

            <div className="flex gap-8">
                {/* LEFT: CONTROLS & LOGS */}
                <div className="w-1/3 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                            Verify CGPA
                        </h1>
                        <span className={`text-xs px-2 py-1 rounded-full ${isConnected ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                    <p className="text-slate-500 text-sm border-b border-slate-800 pb-4">
                        NIT Warangal Portal • Live ZK Verification
                    </p>

                    {!result ? (
                        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                            <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Portal Credentials</label>
                            <input
                                placeholder="Registration Number"
                                className="w-full bg-slate-950 border border-slate-700 p-3 mb-4 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                                value={creds.username}
                                onChange={e => setCreds({ ...creds, username: e.target.value })}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full bg-slate-950 border border-slate-700 p-3 mb-6 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                                value={creds.password}
                                onChange={e => setCreds({ ...creds, password: e.target.value })}
                            />
                            <button
                                onClick={handleStart}
                                disabled={!isConnected || isVerifying || !creds.username || !creds.password}
                                className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white disabled:text-slate-500 font-bold py-3 rounded-xl transition-all"
                            >
                                {isVerifying ? 'Verifying...' : 'Start Verification'}
                            </button>
                        </div>
                    ) : (
                        <div className="bg-green-900/20 border border-green-500/50 p-6 rounded-xl flex flex-col items-center">
                            <h2 className="text-xl font-bold text-green-400 mb-4">✅ Identity Verified</h2>

                            <div className="bg-white p-4 rounded-xl mb-4 shadow-xl">
                                <QRCodeSVG
                                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${result.recordId}`}
                                    size={150}
                                />
                            </div>

                            <p className="text-xs text-center text-green-300 mb-4">
                                Scan to view Verified Profile
                            </p>

                            <a
                                href={`/verify/${result.recordId}`}
                                target="_blank"
                                className="bg-green-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-green-500 w-full text-center mb-3 transition-colors"
                            >
                                Open Profile Page ↗
                            </a>

                            <a
                                href={`https://zkverify-testnet.subscan.io/extrinsic/${result.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-green-400 hover:underline"
                            >
                                View Transaction: {result.txHash.slice(0, 20)}...
                            </a>
                        </div>
                    )}

                    {/* STATUS */}
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                        <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Status</label>
                        <p className="text-sm text-blue-400">{status}</p>
                    </div>

                    {/* LOGS */}
                    <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 overflow-y-auto max-h-[300px]">
                        <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Activity Log</label>
                        <div className="text-xs text-green-400 space-y-1 font-mono">
                            {logs.length === 0 ? (
                                <span className="text-slate-600">Waiting for verification...</span>
                            ) : (
                                logs.map((l, i) => <div key={i}>{l}</div>)
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: LIVE STREAM */}
                <div className="w-2/3 flex flex-col gap-6">
                    <div className="relative w-full aspect-video bg-slate-900 rounded-2xl border-2 border-slate-800 overflow-hidden shadow-2xl">
                        {isVerifying && (
                            <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded animate-pulse z-10">
                                ● LIVE SERVER VIEW
                            </div>
                        )}
                        {!isVerifying && !result && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center text-slate-600">
                                    <div className="text-6xl mb-4">🔐</div>
                                    <p className="text-lg">Enter credentials and start verification</p>
                                    <p className="text-sm mt-2">The browser session will stream here live</p>
                                </div>
                            </div>
                        )}
                        {result && (
                            <div className="absolute inset-0 flex items-center justify-center bg-green-900/30">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">✅</div>
                                    <p className="text-2xl font-bold text-green-400">Verification Complete</p>
                                    <p className="text-sm mt-2 text-green-300">Proof settled on zkVerify blockchain</p>
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
