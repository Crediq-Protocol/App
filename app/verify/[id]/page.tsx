import fs from 'fs';
import path from 'path';

interface VerificationRecord {
    id: string;
    username: string;
    cgpa: number;
    txHash: string;
    attestationId: string;
    timestamp: string;
}

export default async function VerifiedPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const dbPath = path.join(process.cwd(), 'db.json');
    let record: VerificationRecord | null = null;

    try {
        if (fs.existsSync(dbPath)) {
            const data: VerificationRecord[] = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            record = data.find((r) => r.id === id) || null;
        }
    } catch (e) {
        console.error("DB Read Error", e);
    }

    if (!record) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="p-10 text-red-500 font-bold text-center text-xl">
                    ❌ Record Not Found
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col items-center justify-center p-6">
            <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full border-t-8 border-green-500">

                {/* GREEN BADGE */}
                <div className="flex justify-center mb-6">
                    <div className="bg-green-100 text-green-600 rounded-full p-4">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
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
