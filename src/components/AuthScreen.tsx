import React, { useState } from 'react';
import { signInWithGoogle } from '../lib/firebase';
import { Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export const AuthScreen: React.FC = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsAuthenticating(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('AuthScreen: Login failed:', error);
      setErrorMsg('Sign in was cancelled or failed. Please try again.');
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-zinc-900 flex flex-col justify-center items-center px-6 py-12 selection:bg-amber-100">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-xs text-center space-y-10"
      >
        {/* Typographic Logo & Slogan */}
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center gap-1.5">
            <span className="text-3xl sm:text-4xl font-black tracking-[0.25em] font-mono text-zinc-950 uppercase select-none">
              LEDGER
            </span>
          </div>

          <p className="text-xs text-zinc-500 font-serif italic tracking-wide leading-relaxed">
            “A Lannister always pays his debts”
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
            {errorMsg}
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-4 pt-2">
          <button
            onClick={handleLogin}
            disabled={isAuthenticating}
            className="w-full py-3.5 px-5 bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] disabled:active:scale-100 disabled:opacity-75 text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-3 cursor-pointer disabled:cursor-not-allowed"
          >
            {isAuthenticating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" className="w-4.5 h-4.5 shrink-0">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 3.447 29.352 1 24 1C11.297 1 1 11.297 1 24s10.297 23 23 23c11.297 0 23-10.297 23-23c0-1.559-.18-3.078-.506-4.536z"/>
                  <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 3.447 29.352 1 24 1c-7.785 0-14.659 3.864-18.794 9.774l.1 4.917z"/>
                  <path fill="#4CAF50" d="M24 47c5.139 0 9.715-1.642 13.435-4.437l-6.435-5.263C28.98 38.675 26.608 39 24 39c-5.187 0-9.61-3.298-11.285-7.904l-6.621 5.122C10.375 42.663 16.711 47 24 47z"/>
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.435 5.263C42.947 34.202 47 29.617 47 24c0-1.559-.18-3.078-.506-4.536l-.883.619z"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Encrypted cloud synchronization</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};


