'use client';
import { useEffect, useState } from 'react';
import { auth, logout } from '@/app/lib/firebase';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { QRCodeSVG } from 'qrcode.react';

interface VerificationRecord {
    id: string;
    username: string;
    verificationType: string;
    claimThreshold: number;
    claimResult: boolean;
    cgpa: number;
    txHash: string;
    status: string;
    timestamp: string;
}

// Compact Proof Card
const ProofCard = ({ proof, onClick }: { proof: VerificationRecord; onClick: () => void }) => {
    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'nitw_cgpa': 'Academic',
            'leetcode': 'Developer',
            'income': 'Finance',
        };
        return labels[type] || 'Credential';
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'nitw_cgpa': 'bg-purple-100 text-purple-700',
            'leetcode': 'bg-blue-100 text-blue-700',
            'income': 'bg-green-100 text-green-700',
        };
        return colors[type] || 'bg-slate-100 text-slate-700';
    };

    return (
        <div
            onClick={onClick}
            className="bg-white border border-slate-200 rounded-xl p-5 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${getTypeColor(proof.verificationType)}`}>
                    {getTypeLabel(proof.verificationType)}
                </span>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
            </div>

            {/* Claim */}
            <h3 className="text-slate-900 font-medium text-sm mb-1">CGPA &gt; {proof.claimThreshold}</h3>
            <p className="text-slate-500 text-xs mb-4">NIT Warangal</p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-400">{new Date(proof.timestamp).toLocaleDateString()}</span>
                <span className="text-[10px] text-slate-400 group-hover:text-slate-600 transition-colors flex items-center gap-1">
                    View details
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </span>
            </div>
        </div>
    );
};

// Modal for expanded proof details
const ProofModal = ({ proof, onClose }: { proof: VerificationRecord; onClose: () => void }) => {
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>

                {/* Header */}
                <div className="text-center mb-6 pb-4 border-b border-slate-100">
                    <div className="w-12 h-12 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900">Verified Student</h2>
                    <p className="text-sm text-slate-500">NIT Warangal</p>
                </div>

                {/* QR Code */}
                <div className="flex justify-center mb-4">
                    <div className="bg-slate-50 p-4 rounded-xl">
                        <QRCodeSVG
                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${proof.id}`}
                            size={100}
                        />
                    </div>
                </div>
                <p className="text-[10px] text-center text-slate-400 mb-6">Scan to verify</p>

                {/* Details */}
                <div className="space-y-2 mb-6">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-xs text-slate-500">Registration</span>
                        <span className="text-xs font-mono">{proof.username}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-xs text-slate-500">Claim</span>
                        <span className="text-xs font-medium">CGPA &gt; {proof.claimThreshold}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-xs text-slate-500">Result</span>
                        <span className="text-xs font-medium text-green-600">Passed</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-xs text-slate-500">Verified On</span>
                        <span className="text-xs">{new Date(proof.timestamp).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                    <a
                        href={`/verify/${proof.id}`}
                        target="_blank"
                        className="block w-full text-center bg-slate-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-black transition-colors"
                    >
                        Open Public Profile
                    </a>
                    <a
                        href={`https://zkverify-testnet.subscan.io/extrinsic/${proof.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center bg-slate-100 text-slate-700 py-2.5 rounded-lg text-sm hover:bg-slate-200 transition-colors"
                    >
                        View On-Chain Proof
                    </a>
                </div>
            </div>
        </div>
    );
};

export default function MyProofs() {
    const [user, setUser] = useState<User | null>(null);
    const [proofs, setProofs] = useState<VerificationRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProof, setSelectedProof] = useState<VerificationRecord | null>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                router.push('/');
                return;
            }
            setUser(currentUser);

            // Fetch proofs for this user
            try {
                const res = await fetch(`/api/proofs?uid=${currentUser.uid}`);
                if (res.ok) {
                    const data = await res.json();
                    setProofs(data.proofs);
                }
            } catch (error) {
                console.error('Failed to fetch proofs:', error);
            } finally {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [router]);

    if (!user) return (
        <div className="min-h-screen bg-[#f7f5f4] flex items-center justify-center">
            <div className="text-slate-500 text-sm animate-pulse">Loading...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f7f5f4] text-slate-900 flex font-sans">
            {/* Modal */}
            {selectedProof && (
                <ProofModal proof={selectedProof} onClose={() => setSelectedProof(null)} />
            )}

            {/* SIDEBAR */}
            <aside className="w-72 bg-white border-r border-slate-200 p-6 flex flex-col hidden lg:flex">
                <div className="mb-10 flex items-center gap-3 px-2">
                    <img src="/logo.png" alt="Crediq Logo" className="w-10 h-10 object-contain" />
                    <span className="font-medium text-lg tracking-tight text-slate-900">Crediq Protocol</span>
                </div>

                <div className="px-2 mb-8">
                    <div className="flex items-center gap-3 mb-6 p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <img
                            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=e2e8f0&color=1e293b`}
                            className="w-10 h-10 rounded-full border border-slate-200"
                            alt="Profile"
                        />
                        <div className="overflow-hidden">
                            <h2 className="text-sm font-medium truncate">{user.displayName}</h2>
                            <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 px-2">
                    <button onClick={() => router.push('/dashboard')} className="w-full text-left px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-md text-sm transition-colors">Dashboard</button>
                    <button className="w-full text-left px-3 py-2 bg-slate-100 text-slate-900 rounded-md text-sm font-medium">My Proofs</button>
                    <button className="w-full text-left px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-md text-sm transition-colors">Settings</button>
                </nav>

                <div className="px-2 mt-auto">
                    <button onClick={() => logout()} className="w-full text-left px-3 py-2 text-slate-400 hover:text-slate-600 transition-colors text-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
                <header className="mb-8 max-w-5xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-medium text-slate-900 mb-1">My Proofs</h1>
                        <p className="text-slate-500 text-sm">Your verified credentials and attestations.</p>
                    </div>
                    <div className="text-sm text-slate-400">
                        {proofs.length} proof{proofs.length !== 1 ? 's' : ''}
                    </div>
                </header>

                <div className="max-w-5xl mx-auto">
                    {loading ? (
                        <div className="text-center py-20 text-slate-400">
                            <div className="w-6 h-6 border-2 border-slate-300 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                            Loading proofs...
                        </div>
                    ) : proofs.length === 0 ? (
                        <div className="text-center py-20 bg-white border border-slate-200 rounded-xl">
                            <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-slate-700 mb-2">No proofs yet</h3>
                            <p className="text-slate-500 text-sm mb-6">Complete a verification to see your proofs here.</p>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-black transition-colors"
                            >
                                Start Verification
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {proofs.map((proof) => (
                                <ProofCard
                                    key={proof.id}
                                    proof={proof}
                                    onClick={() => setSelectedProof(proof)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

