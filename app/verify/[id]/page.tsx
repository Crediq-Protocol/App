import admin from 'firebase-admin';

interface VerificationRecord {
    id: string;
    firebaseUid: string | null;
    username: string;
    verificationType: string;
    claimThreshold: number;
    claimResult: boolean;
    cgpa?: number;
    totalSolved?: number;
    breakdown?: { easy: number; medium: number; hard: number };
    txHash: string;
    attestationId: string;
    status: string;
    timestamp: string;
}

function getFirestore() {
    if (admin.apps.length) {
        return admin.firestore();
    }

    try {
        let serviceAccount = null;

        // Load from environment variable (for Vercel/production)
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            console.log('📦 Loading Firebase credentials from environment variable...');
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        }

        if (!serviceAccount) {
            console.warn('⚠️ Firebase credentials not found. Set FIREBASE_SERVICE_ACCOUNT env var');
            return null;
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        return admin.firestore();
    } catch (error) {
        console.warn('⚠️ Firebase Admin not initialized:', error);
        return null;
    }
}

async function getVerification(id: string): Promise<VerificationRecord | null> {
    const db = getFirestore();
    if (!db) {
        console.warn('⚠️ Firestore not available');
        return null;
    }
    try {
        const doc = await db.collection('verifications').doc(id).get();
        if (!doc.exists) return null;
        return doc.data() as VerificationRecord;
    } catch (error) {
        console.error('Failed to fetch from Firestore:', error);
        return null;
    }
}

export default async function VerifiedPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await getVerification(id);

    if (!record) {
        return (
            <div className="min-h-screen bg-stone-100 flex items-center justify-center">
                <div className="p-10 text-slate-500 text-center">
                    Record not found
                </div>
            </div>
        );
    }

    // Determine the verification type for display
    const isLeetCode = record.verificationType === 'leetcode_solved';
    const institutionName = isLeetCode ? 'LeetCode' : 'NIT Warangal';
    const claimLabel = isLeetCode ? `Problems Solved ≥ ${record.claimThreshold}` : `CGPA > ${record.claimThreshold}`;

    return (
        <div className="min-h-screen bg-stone-100 text-slate-900 font-sans flex flex-col items-center justify-center p-6">
            <div className="bg-white border border-slate-200 rounded p-8 max-w-md w-full">

                {/* Header */}
                <div className="text-center mb-6 pb-6 border-b border-slate-100">
                    <div className="w-12 h-12 bg-slate-100 rounded-full mx-auto flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h1 className="text-lg font-semibold">Verified {isLeetCode ? 'Developer' : 'Student'}</h1>
                    <p className="text-sm text-slate-500">{institutionName}</p>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-500">{isLeetCode ? 'Username' : 'Candidate'}</span>
                        <span className="text-sm font-mono">{record.username}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-500">Claim</span>
                        <span className="text-sm font-medium">{claimLabel}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-500">Result</span>
                        <span className={`text-sm font-medium ${record.claimResult ? 'text-green-600' : 'text-red-600'}`}>
                            {record.claimResult ? 'Passed' : 'Failed'}
                        </span>
                    </div>
                    {isLeetCode && record.totalSolved && (
                        <div className="flex justify-between py-2 border-b border-slate-100">
                            <span className="text-sm text-slate-500">Problems Solved</span>
                            <span className="text-sm">{record.totalSolved}</span>
                        </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-500">Status</span>
                        <span className="text-sm capitalize">{record.status}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-500">Attestation Date</span>
                        <span className="text-sm">{new Date(record.timestamp).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* On-chain link */}
                <div>
                    <a
                        href={`https://zkverify-testnet.subscan.io/extrinsic/${record.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center bg-slate-100 text-slate-700 py-3 rounded text-sm hover:bg-slate-200 transition-colors"
                    >
                        View On-Chain Proof
                    </a>
                    <p className="text-[10px] text-center mt-2 text-slate-400 font-mono">
                        Tx: {record.txHash.slice(0, 24)}...
                    </p>
                </div>
            </div>

            <div className="mt-6 text-xs text-slate-400">
                Crediq
            </div>
        </div>
    );
}
