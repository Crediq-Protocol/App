'use client';
import { loginWithGoogle } from '@/app/lib/firebase';
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
    <main className="h-screen w-full flex flex-col lg:flex-row bg-stone-50 overflow-hidden">

      {/* Left Column - Image (60%) */}
      <div className="w-full lg:w-[60%] p-4 lg:p-6 flex items-center justify-center bg-stone-50">
        <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-sm">
          <img
            src="/final.svg"
            alt="Crediq Visualization"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Right Column - Login Form (40%) */}
      <div className="w-full lg:w-[40%] flex flex-col items-center justify-center p-8 bg-white">
        <div className="max-w-sm w-full">

          <div className="text-center space-y-6">
            <h1 className="text-4xl font-serif text-slate-900 tracking-tight">Crediq Protocol</h1>
            <p className="text-slate-500 font-light text-lg">Verify claims without revealing data</p>
          </div>

          <div className="pt-10 pb-12">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] text-white hover:bg-black transition-all font-medium py-3.5 rounded-full disabled:opacity-50"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
          </div>

          <div className="text-center space-y-4">
            <p className="text-xs text-slate-400">Privacy-first verification</p>
            <p className="text-xs text-slate-400">
              By signing up you agree to our <br />
              <a href="#" className="hover:text-slate-500 transition-colors">Privacy Policy</a> and <a href="#" className="hover:text-slate-500 transition-colors">Terms of Service</a>.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
