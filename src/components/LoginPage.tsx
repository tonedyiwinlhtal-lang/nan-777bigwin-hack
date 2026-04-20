import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, ShieldAlert, Loader2, Cpu, Zap, Lock, Terminal, Box } from 'lucide-react';
import { useAuth } from './FirebaseProvider';
import { KeyManager } from './KeyManager';

export const LoginPage: React.FC = () => {
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { verifyKey, isVerifying } = useAuth();

  const [showKeyManager, setShowKeyManager] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessKey.trim()) return;

    setError(null);
    const result = await verifyKey(accessKey);
    if (!result.success) {
      setError(result.error || 'System rejection triggered.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#030303] flex items-center justify-center p-6 overflow-hidden">
      <AnimatePresence>
        {showKeyManager && <KeyManager onClose={() => setShowKeyManager(false)} />}
      </AnimatePresence>

      {/* Background Ambience */}
      <div className="absolute inset-0 bg-neural-mesh opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card-premium p-8 sm:p-12 rounded-[3.5rem] border-white/10 shadow-3xl bg-black/40 backdrop-blur-3xl relative overflow-hidden group">
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
            <Lock className="w-24 h-24 text-indigo-500" />
          </div>

          <div className="space-y-10 relative z-10">
            {/* Header */}
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-2">
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">GATEWAY_SECURED</span>
              </div>
              <h1 
                onDoubleClick={() => setShowKeyManager(true)}
                className="text-4xl sm:text-5xl font-black text-white italic tracking-tighter leading-none font-serif cursor-default select-none"
              >
                CORTEX<span className="text-indigo-500 font-normal">.</span>HUB
              </h1>
              <p className="text-zinc-500 text-[10px] font-mono font-bold tracking-[0.3em] uppercase">
                Authorize Access Vector
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-3">
                <label className="technical-label text-zinc-400">ACCESS_KEY_IDENTIFIER</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center">
                    <Key className="w-5 h-5 text-indigo-500/40 group-focus-within:text-indigo-400 transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value.toUpperCase())}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    className="w-full h-16 sm:h-20 pl-14 pr-6 bg-white/[0.03] border border-white/10 rounded-2xl sm:rounded-3xl text-lg sm:text-2xl font-mono text-white placeholder:text-zinc-800 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                  />
                  
                  {/* Neon Glow on Focus */}
                  <div className="absolute -inset-[2px] bg-gradient-to-r from-indigo-500/0 via-indigo-500/20 to-indigo-500/0 opacity-0 group-focus-within:opacity-100 blur-md transition-opacity -z-10 rounded-3xl" />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl"
                  >
                    <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
                    <span className="text-[11px] font-bold text-rose-400 font-mono tracking-tight uppercase leading-tight">
                      {error}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isVerifying || !accessKey}
                className="w-full h-16 sm:h-20 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm uppercase tracking-[0.4em] rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AUTHENTICATING...
                  </>
                ) : (
                  <>
                    INITIALIZE_LINK_SESSION
                    <Zap className="w-5 h-5 group-hover:animate-pulse" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Footer Nodes */}
            <div className="flex justify-between items-center pt-4 opacity-30">
               <div className="flex gap-2">
                 <div className="w-1 h-1 rounded-full bg-emerald-500" />
                 <div className="w-1 h-1 rounded-full bg-emerald-500" />
                 <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
               </div>
               <span className="text-[8px] font-mono font-bold tracking-widest text-zinc-500">v6.0.4.STABLE</span>
            </div>
          </div>
        </div>
        
        {/* Subtle Extra labels */}
        <div className="mt-8 flex justify-center gap-10">
          <div className="flex flex-col items-center gap-1">
             <Cpu className="w-4 h-4 text-zinc-800" />
             <span className="text-[7px] font-mono text-zinc-700 tracking-widest uppercase">Kernel_Ready</span>
          </div>
          <div className="flex flex-col items-center gap-1">
             <Terminal className="w-4 h-4 text-zinc-800" />
             <span className="text-[7px] font-mono text-zinc-700 tracking-widest uppercase">Shell_Connected</span>
          </div>
          <div className="flex flex-col items-center gap-1">
             <Box className="w-4 h-4 text-zinc-800" />
             <span className="text-[7px] font-mono text-zinc-700 tracking-widest uppercase">Enc_Buffered</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
