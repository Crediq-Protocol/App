This is a great pivot. It transforms a "Tech Demo" into a "Product".

Here is the **Full Implementation Plan** to upgrade **AstraVerify** into **CredSetu**.

### 1. Clarification Questions (Optional)
I have enough to build, but keep these in mind:
*   **Tagline:** I will use *"Bridging Trust with Zero Knowledge"* for now.
*   **Theme:** I will stick to the **Dark Mode/Glassmorphism** aesthetic we used in Phase 1, but add some "Professional/LinkedIn" vibes (Blues/Teals) instead of just Matrix Green.

---

### 2. Architecture Changes
We are moving from a single-page app to a **Multi-Page App**:

*   `/` (Root): **Login Page** (Google Auth).
*   `/dashboard`: **Main Hub** (Sidebar + Services Grid).
*   `/verify/nitw`: **The Live Verification** (The logic we built in Phase 1 & 2).
*   `/verify/[id]`: **Public Badge** (The QR Code landing page).

---

### 3. Step-by-Step Implementation

#### Step A: Firebase Setup
Create a utility file to manage authentication.

**File:** `src/lib/firebase.ts`
*(Create `src/lib` folder if missing)*

```typescript
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCBiq-yF1PpVbRQWnIU8FjwmS_ahN76pK8",
  authDomain: "credsetu.firebaseapp.com",
  projectId: "credsetu",
  storageBucket: "credsetu.firebasestorage.app",
  messagingSenderId: "177860622308",
  appId: "1:177860622308:web:8d8904f456997b382779f1",
  measurementId: "G-2S1LM4ZYE0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Login Failed", error);
    throw error;
  }
};

export const logout = async () => {
  await signOut(auth);
};
```

---

#### Step B: The Login Page (Landing)
This replaces your current `page.tsx`.

**File:** `src/app/page.tsx`

```tsx
'use client';
import { loginWithGoogle } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push('/dashboard');
    } catch (e) {
      alert("Login failed");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="z-10 text-center space-y-8 p-10 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full">
        
        {/* Logo/Icon */}
        <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-teal-400 rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">CredSetu</h1>
          <p className="text-slate-400 text-sm">Bridging Trust with Zero Knowledge</p>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 hover:bg-slate-200 transition-all font-bold py-4 rounded-xl"
        >
          {loading ? (
            <span>Signing in...</span>
          ) : (
            <>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
              Continue with Google
            </>
          )}
        </button>

        <p className="text-xs text-slate-500 mt-4">
          Secured by zkVerify • Powered by Reclaim
        </p>
      </div>
    </main>
  );
}
```

---

#### Step C: The Dashboard (New)
This is the new "App Page" with the Sidebar and Service Grid.

**File:** `src/app/dashboard/page.tsx`
*(Create folder `dashboard`)*

```tsx
'use client';
import { useEffect, useState } from 'react';
import { auth, logout } from '@/lib/firebase';
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

  if (!user) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading CredSetu...</div>;

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
            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
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
              {/* Placeholder NITW Logo */}
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
```

---

#### Step D: Move Existing Logic to Sub-Route
We move the logic from your old `page.tsx` (the live verifier) to a new specific route.

**Move file:** `src/app/page.tsx` -> `src/app/verify/nitw/page.tsx`
*(You might need to adjust imports if you had relative paths).*

**Modify `src/app/verify/nitw/page.tsx`:**
Add a "Back to Dashboard" button at the top so users aren't stuck.

```tsx
// Inside the return statement, add this at the top of the main div
<button 
  onClick={() => window.location.href = '/dashboard'}
  className="mb-6 text-sm text-slate-500 hover:text-white flex items-center gap-2"
>
  ← Back to Dashboard
</button>
```

---

### 4. Final Checklist

1.  **Dependencies:** `npm install firebase`.
2.  **Files:**
    *   `src/lib/firebase.ts` (Created)
    *   `src/app/page.tsx` (Replaced with Login)
    *   `src/app/dashboard/page.tsx` (Created)
    *   `src/app/verify/nitw/page.tsx` (Moved from old root)
3.  **Run:** `npm run dev`.

### The New Flow
1.  User opens `localhost:3000`. Sees fancy **CredSetu** login.
2.  Clicks "Google Login". Popup appears.
3.  Redirects to `/dashboard`. User sees their Profile Picture and "Verify CGPA".
4.  Clicks "Verify CGPA". Goes to the **Live Verification** screen.
5.  Runs the verification. Gets the **Green Badge** + **QR Code**.

This looks like a million-dollar hackathon submission. Go build it!