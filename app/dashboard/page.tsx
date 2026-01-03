'use client';
import { useEffect, useState } from 'react';
import { auth, logout } from '@/app/lib/firebase';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';

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

    if (!user) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-slate-500 flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                Loading CredSetu...
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white flex">

            {/* SIDEBAR (Profile) */}
            <aside className="w-80 bg-slate-900 border-r border-slate-800 p-8 flex flex-col">
                <div className="mb-10 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-400 rounded-lg"></div>
                    <span className="font-bold text-xl tracking-tight">CredSetu</span>
                </div>

                <div className="flex flex-col items-center mb-10">
                    <img
                        src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=0f172a&color=fff`}
                        className="w-24 h-24 rounded-full border-4 border-slate-800 mb-4 shadow-xl"
                        alt="Profile"
                    />
                    <h2 className="text-lg font-bold">{user.displayName}</h2>
                    <p className="text-xs text-slate-500">{user.email}</p>
                    <div className="mt-4 px-3 py-1 bg-green-900/30 border border-green-600/50 rounded-full text-xs text-green-400">
                        Verified User
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <button className="w-full text-left px-4 py-3 bg-slate-800 rounded-lg text-white font-medium">Dashboard</button>
                    <button className="w-full text-left px-4 py-3 text-slate-400 hover:bg-slate-800/50 rounded-lg transition-colors">My Proofs</button>
                    <button className="w-full text-left px-4 py-3 text-slate-400 hover:bg-slate-800/50 rounded-lg transition-colors">Settings</button>
                </nav>

                <button onClick={() => logout()} className="text-sm text-slate-500 hover:text-white transition-colors mt-auto flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    Sign Out
                </button>
            </aside>

            {/* MAIN CONTENT (Services) */}
            <main className="flex-1 p-12">
                <header className="mb-12">
                    <h1 className="text-3xl font-bold mb-2">Available Services</h1>
                    <p className="text-slate-400">Select a provider to verify your credentials instantly.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* SERVICE 1: NIT WARANGAL (Active) */}
                    <div
                        onClick={() => router.push('/verify/nitw')}
                        className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 hover:bg-slate-800 transition-all cursor-pointer overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </div>
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-6">
                            <span className="text-slate-900 font-bold text-xl">N</span>
                        </div>
                        <h3 className="text-lg font-bold mb-2 text-white group-hover:text-blue-400 transition-colors">Verify CGPA</h3>
                        <p className="text-sm text-slate-400 mb-4">NIT Warangal Portal</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span> Live
                        </div>
                    </div>

                    {/* SERVICE 2: SALARY (Coming Soon) */}
                    <div className="opacity-60 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 cursor-not-allowed">
                        <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6">
                            <span className="text-slate-500 font-bold">$</span>
                        </div>
                        <h3 className="text-lg font-bold mb-2 text-slate-300">Verify Salary</h3>
                        <p className="text-sm text-slate-500 mb-4">Payroll / Bank Statement</p>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Coming Soon
                        </div>
                    </div>

                    {/* SERVICE 3: WORK HISTORY (Coming Soon) */}
                    <div className="opacity-60 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 cursor-not-allowed">
                        <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6">
                            <span className="text-slate-500 font-bold">L</span>
                        </div>
                        <h3 className="text-lg font-bold mb-2 text-slate-300">Work History</h3>
                        <p className="text-sm text-slate-500 mb-4">LinkedIn / Experience Letter</p>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Coming Soon
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
