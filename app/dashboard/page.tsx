'use client';
import { useEffect, useState } from 'react';
import { auth, logout } from '@/app/lib/firebase';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Warp } from "@paper-design/shaders-react";

interface VerificationCardProps {
    title: string;
    claim: string;
    details: string;
    context?: string;
    tags: string[];
    isLive: boolean;
    onAction: () => void;
    shaderConfig: any;
}

const VerificationCard = ({ title, claim, details, context, tags, isLive, onAction, shaderConfig }: VerificationCardProps) => (
    <div
        className={`relative overflow-hidden border border-slate-200 rounded-2xl flex flex-col justify-between transition-all duration-200 group ${isLive ? 'hover:shadow-xl hover:-translate-y-1' : 'opacity-80'}`}
    >
        {/* Shader Background */}
        <div className="absolute inset-0 z-0">
            <Warp
                style={{ height: "100%", width: "100%" }}
                {...shaderConfig}
                scale={1}
                rotation={0}
                speed={0.8}
            />
        </div>

        {/* Dark Overlay for Readability */}
        <div className="absolute inset-0 bg-black/70 z-0 transition-opacity duration-300 group-hover:bg-black/60" />

        {/* Content Container */}
        <div className="relative z-10 p-6 flex flex-col h-full justify-between">
            {/* Header: Title + Status */}
            <div className="flex items-start justify-between mb-4">
                <h3 className="text-white/90 font-medium text-sm tracking-wide">{title}</h3>
                {isLive && (
                    <span className="bg-white text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider">LIVE</span>
                )}
            </div>

            {/* Content */}
            <div className="mb-6">
                <p className="text-white font-medium text-lg leading-snug mb-2">{claim}</p>
                <p className="text-gray-300 text-sm leading-relaxed mb-3">{details}</p>
                {context && (
                    <p className="text-gray-400 text-xs italic">{context}</p>
                )}
            </div>

            {/* Footer: Tags + Action */}
            <div className="mt-auto">
                <div className="flex flex-wrap gap-2 mb-6">
                    {tags.map((tag, i) => (
                        <span key={i} className="bg-white/10 border border-white/10 text-white/80 text-[10px] px-2 py-1 rounded-full">{tag}</span>
                    ))}
                </div>

                <button
                    onClick={onAction}
                    disabled={!isLive}
                    className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${isLive
                        ? 'bg-white text-black hover:bg-gray-200'
                        : 'bg-transparent text-white/30 cursor-default border border-white/20 hover:bg-white/5'
                        }`}
                >
                    {isLive ? 'Start verification' : 'Coming Soon'}
                </button>
            </div>
        </div>
    </div>
);

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) router.push('/');
            else setUser(currentUser);
        });
        return () => unsubscribe();
    }, [router]);

    // Shader Configuration Logic
    const getShaderConfig = (index: number) => {
        const configs = [
            {
                proportion: 0.3,
                softness: 0.8,
                distortion: 0.15,
                swirl: 0.6,
                swirlIterations: 8,
                shape: "checks" as const,
                shapeScale: 0.08,
                colors: ["hsl(280, 100%, 30%)", "hsl(320, 100%, 60%)", "hsl(340, 90%, 40%)", "hsl(300, 100%, 70%)"],
            },
            {
                proportion: 0.4,
                softness: 1.2,
                distortion: 0.2,
                swirl: 0.9,
                swirlIterations: 12,
                shape: "dots" as const,
                shapeScale: 0.12,
                colors: ["hsl(200, 100%, 25%)", "hsl(180, 100%, 65%)", "hsl(160, 90%, 35%)", "hsl(190, 100%, 75%)"],
            },
            {
                proportion: 0.35,
                softness: 0.9,
                distortion: 0.18,
                swirl: 0.7,
                swirlIterations: 10,
                shape: "checks" as const,
                shapeScale: 0.1,
                colors: ["hsl(120, 100%, 25%)", "hsl(140, 100%, 60%)", "hsl(100, 90%, 30%)", "hsl(130, 100%, 70%)"],
            },
            {
                proportion: 0.45,
                softness: 1.1,
                distortion: 0.22,
                swirl: 0.8,
                swirlIterations: 15,
                shape: "dots" as const,
                shapeScale: 0.09,
                colors: ["hsl(30, 100%, 35%)", "hsl(50, 100%, 65%)", "hsl(40, 90%, 40%)", "hsl(45, 100%, 75%)"],
            },
            {
                proportion: 0.38,
                softness: 0.95,
                distortion: 0.16,
                swirl: 0.85,
                swirlIterations: 11,
                shape: "checks" as const,
                shapeScale: 0.11,
                colors: ["hsl(250, 100%, 30%)", "hsl(270, 100%, 65%)", "hsl(260, 90%, 35%)", "hsl(265, 100%, 70%)"],
            },
            {
                proportion: 0.42,
                softness: 1.0,
                distortion: 0.19,
                swirl: 0.75,
                swirlIterations: 9,
                shape: "dots" as const,
                shapeScale: 0.13,
                colors: ["hsl(330, 100%, 30%)", "hsl(350, 100%, 60%)", "hsl(340, 90%, 35%)", "hsl(345, 100%, 75%)"],
            },
        ];
        return configs[index % configs.length];
    };

    if (!user) return (
        <div className="min-h-screen bg-[#fcfaf9] flex items-center justify-center">
            <div className="text-slate-500 text-sm animate-pulse">Loading Crediq...</div>
        </div>
    );

    const verifications = [
        {
            title: "Academic Threshold",
            claim: "Prove you have a CGPA greater than 6.0",
            details: "Only the condition is proven — not your grades or transcript.",
            context: "Verified against the NIT Warangal academic portal.",
            tags: ["Education", "Eligibility", "Zero-Knowledge"],
            isLive: true,
            onAction: () => router.push('/verify/nitw')
        },
        {
            title: "Problem-Solving Activity",
            claim: "Prove you’ve solved 5+ problems on LeetCode",
            details: "Activity is verified without revealing submissions or history.",
            tags: ["Developer", "Activity", "Privacy"],
            isLive: true,
            onAction: () => router.push('/verify/leetcode')
        },
        {
            title: "Account Ownership",
            claim: "Prove that this X account belongs to you",
            details: "Ownership is verified without OAuth permissions or screenshots.",
            tags: ["Identity", "Ownership", "Security"],
            isLive: false,
            onAction: () => { }
        },
        {
            title: "Income Threshold",
            claim: "Prove your annual income exceeds a required amount",
            details: "The threshold is proven without sharing documents or exact numbers.",
            tags: ["Finance", "Privacy", "Zero-Knowledge"],
            isLive: false,
            onAction: () => { }
        },
        {
            title: "Work Experience",
            claim: "Prove you’ve worked for more than a required number of years",
            details: "Activity is verified without revealing submissions or history.",
            tags: ["Career", "Experience", "Validation"],
            isLive: false,
            onAction: () => { }
        },
        {
            title: "Age Eligibility",
            claim: "Prove you are above a required age",
            details: "The threshold is proven without sharing documents or exact numbers.",
            tags: ["Identity", "Age", "Compliance"],
            isLive: false,
            onAction: () => { }
        }
    ];

    return (
        <div className="min-h-screen bg-[#f7f5f4] text-slate-900 flex font-sans">
            {/* SIDEBAR */}
            <aside className="w-72 bg-white border-r border-slate-200 p-6 flex flex-col hidden lg:flex">
                <div className="mb-10 px-2">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Crediq Logo" className="w-9 h-9 object-contain flex-shrink-0" />
                        <span className="font-medium text-slate-900 whitespace-nowrap">Crediq Protocol</span>
                        <span className="text-[8px] font-medium uppercase text-slate-400 flex-shrink-0">beta</span>
                    </div>
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
                    <button className="w-full text-left px-3 py-2 bg-slate-100 text-slate-900 rounded-md text-sm font-medium">Dashboard</button>
                    <button onClick={() => router.push('/proofs')} className="w-full text-left px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-md text-sm transition-colors">My Proofs</button>
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
                <header className="mb-10 max-w-5xl mx-auto">
                    <h1 className="text-2xl font-medium text-slate-900 mb-2">Available verifications</h1>
                    <p className="text-slate-500 text-base">Select a claim to prove — without exposing underlying data.</p>
                </header>

                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {verifications.map((v, idx) => (
                        <VerificationCard key={idx} {...v} shaderConfig={getShaderConfig(idx)} />
                    ))}
                </div>

                {/* Footer Strip */}
                <div className="max-w-5xl mx-auto mt-14 mb-8 text-center group cursor-default">
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-slate-100 border border-slate-200 transition-all duration-300 hover:bg-slate-200 hover:border-slate-300 hover:shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                        <p className="text-slate-600 text-base font-medium tracking-tight">
                            More verifications coming soon · In collaboration with institutional partners
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
