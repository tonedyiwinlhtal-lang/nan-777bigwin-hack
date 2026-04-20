import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, ShieldAlert, Loader2, Cpu, Zap, Lock, Terminal, Box } from 'lucide-react';
import { useAuth } from './FirebaseProvider';
import { KeyManager } from './KeyManager';

export const LoginPage: React.FC = () => {
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState<string | null>(localStorage.getItem('cortex_logout_reason'));
  const { verifyKey, isVerifying } = useAuth();
  const [showKeyManager, setShowKeyManager] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('cortex_logout_reason')) {
      localStorage.removeItem('cortex_logout_reason');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessKey.trim()) return;
    setError(null);
    const result = await verifyKey(accessKey);
    if (!result.success) {
      setError(result.error || 'Identity Verification Failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#020204] flex items-center justify-center p-6 overflow-hidden selection:bg-indigo-500/30">
      <AnimatePresence>
        {showKeyManager && <KeyManager onClose={() => setShowKeyManager(false)} />}
      </AnimatePresence>

      {/* Cinematic Background Architecture */}
      <div className="absolute inset-0 bg-neural-mesh opacity-10 pointer-events-none" />
      
      {/* Dynamic Neural Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 -left-20 w-[40rem] h-[40rem] bg-indigo-600 blur-[150px] rounded-full pointer-events-none"
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          x: [0, -40, 0],
          y: [0, 60, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/4 -right-20 w-[30rem] h-[30rem] bg-rose-600 blur-[150px] rounded-full pointer-events-none"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="w-full max-w-xl relative z-10"
      >
        {/* Prime Authentication Shell */}
        <div className="relative glass-card-premium p-10 sm:p-20 rounded-[3rem] sm:rounded-[4.5rem] border border-white/5 bg-black/40 backdrop-blur-[100px] shadow-[0_50px_100px_rgba(0,0,0,1)] overflow-hidden group">
          
          {/* Internal Glow Accents */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/10 to-transparent" />

          <div className="space-y-12 relative z-10">
            {/* Brand Header */}
            <div className="space-y-6 text-center">
              <motion.div 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                onDoubleClick={() => setShowKeyManager(true)}
                className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 border border-white/10 rounded-full group/badge cursor-default active:scale-95 transition-all"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,1)]" />
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] group-hover:text-white transition-colors">Neural_Protocol_Active</span>
              </motion.div>
              
              <div className="space-y-2">
                <h1 className="text-5xl sm:text-7xl font-black text-white italic tracking-tighter leading-none select-none">
                  CORTEX<span className="text-indigo-500 text-glow-indigo">.</span>
                </h1>
                <p className="text-zinc-500 text-[11px] font-mono font-black tracking-[0.6em] uppercase">
                  Privileged_Access_Unit
                </p>
              </div>
            </div>

            {/* Tactical Login Form */}
            <form onSubmit={handleLogin} className="space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em]">Auth_Vector_Input</label>
                  <Key className="w-3.5 h-3.5 text-zinc-800" />
                </div>
                <div className="relative group">
                  <input 
                    type="text" 
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value.toUpperCase())}
                    placeholder="ENTER_KEY_CODE"
                    className="w-full h-20 sm:h-24 px-10 bg-white/[0.02] border border-white/5 rounded-3xl sm:rounded-[2.5rem] text-2xl sm:text-4xl font-black font-mono text-white placeholder:text-zinc-850 focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.04] transition-all text-center tracking-[0.2em]"
                    spellCheck="false"
                    autoComplete="off"
                  />
                  
                  {/* Subtle Input Particles */}
                  <div className="absolute top-1/2 left-4 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500/20 blur-[1px]" />
                  <div className="absolute top-1/2 right-4 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-rose-500/20 blur-[1px]" />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="relative p-6 bg-rose-500/5 border border-rose-500/20 rounded-[2rem] overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                    <div className="flex items-center gap-4">
                      <ShieldAlert className="w-6 h-6 text-rose-500 shrink-0" />
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-0.5">Critical_Alert</p>
                        <p className="text-xs font-bold text-rose-200/60 font-mono tracking-tight uppercase leading-tight">
                          {error}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isVerifying || !accessKey}
                className="relative w-full h-20 sm:h-24 bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 text-white font-black text-xs sm:text-sm uppercase tracking-[0.6em] rounded-3xl sm:rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(79,70,229,0.5)] transition-all flex items-center justify-center gap-6 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isVerifying ? (
                  <div className="flex items-center gap-4">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>VERIFYING_IDENTITY...</span>
                  </div>
                ) : (
                  <>
                    <span>IDENTITY_SYNC</span>
                    <Zap className="w-5 h-5 group-hover:animate-pulse group-hover:scale-125 transition-transform" />
                  </>
                )}
                
                {/* Button Scanline */}
                <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
                   <motion.div 
                     animate={{ y: ['-100%', '200%'] }} 
                     transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                     className="absolute inset-x-0 h-1/2 bg-gradient-to-b from-transparent via-white/5 to-transparent" 
                   />
                </div>
              </motion.button>
            </form>

            {/* Tactical Meta Info */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-8 gap-6">
                <div className="flex gap-4">
                  {[Cpu, Terminal, Zap].map((Icon, idx) => (
                    <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-all cursor-crosshair">
                      <Icon className="w-4 h-4 text-zinc-600 group-hover:text-indigo-500" />
                    </div>
                  ))}
                </div>
                <div className="text-right">
                   <p className="text-xs font-black text-white italic tracking-tighter">SECURED_SYSTEM_v6<span className="text-indigo-500">.</span>0</p>
                   <p className="text-[8px] font-mono font-bold text-zinc-600 uppercase tracking-[0.4em] mt-1">Uplink_Node: AS_SE_034</p>
                </div>
            </div>
          </div>
        </div>
        
        {/* Subtle Bottom Metadata */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex justify-center items-center gap-8 text-[9px] font-mono font-black text-zinc-800 uppercase tracking-[0.5em]"
        >
           <span>P2P_Encrypted</span>
           <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 shadow-[0_0_8px_rgba(0,0,0,0.5)]" />
           <span>Root_Authorized</span>
        </motion.div>
      </motion.div>
    </div>
  );
};
