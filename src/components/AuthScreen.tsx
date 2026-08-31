import React, { useState } from 'react';
import { signInWithGoogle } from '../lib/firebase';
import { DollarSign, Smartphone, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export const AuthScreen: React.FC = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = async () => {
    setIsAuthenticating(true);
    try {
      await signInWithGoogle();
      // onAuthStateChanged will handle the redirect/view change
    } catch (error) {
      console.error('AuthScreen: Login failed:', error);
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] bg-zinc-900 border border-zinc-800 rounded-[44px] p-8 text-center shadow-2xl relative overflow-hidden"
      >
        {/* Aesthetic Background Accents */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-indigo-500" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="flex justify-center mb-8">
          <div className="h-20 w-20 rounded-3xl bg-zinc-800 text-emerald-400 flex items-center justify-center shadow-xl border border-zinc-700">
            <DollarSign className="w-10 h-10" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Debt Ledger</h1>
        <p className="text-zinc-400 text-sm mb-10 leading-relaxed px-4">
          Professional debt management for personal and business spaces. 
          <span className="block mt-1 text-emerald-400 font-medium">Synced securely to your account.</span>
        </p>

        <button
          onClick={handleLogin}
          disabled={isAuthenticating}
          className="w-full py-4 bg-white hover:bg-zinc-100 active:scale-95 disabled:active:scale-100 disabled:opacity-70 text-zinc-950 font-extrabold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 mb-6 cursor-pointer disabled:cursor-not-allowed"
        >
          {isAuthenticating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48" className="w-5 h-5">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 3.447 29.352 1 24 1C11.297 1 1 11.297 1 24s10.297 23 23 23c11.297 0 23-10.297 23-23c0-1.559-.18-3.078-.506-4.536z"/>
                <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 3.447 29.352 1 24 1c-7.785 0-14.659 3.864-18.794 9.774l.1 4.917z"/>
                <path fill="#4CAF50" d="M24 47c5.139 0 9.715-1.642 13.435-4.437l-6.435-5.263C28.98 38.675 26.608 39 24 39c-5.187 0-9.61-3.298-11.285-7.904l-6.621 5.122C10.375 42.663 16.711 47 24 47z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.435 5.263C42.947 34.202 47 29.617 47 24c0-1.559-.18-3.078-.506-4.536l-.883.619z"/>
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
          <Smartphone className="w-3 h-3" />
          <span>iPhone Edition • Free Cloud Sync</span>
        </div>
      </motion.div>
    </div>
  );
};
