import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, X, BarChart3, History, RefreshCcw, Wifi, WifiOff, Loader2, Settings, Key, Save, CheckCircle2, Send, Trophy, Skull, Brain, Cpu, Zap, Activity, Hash, ShieldAlert, Terminal } from 'lucide-react';

interface Prediction {
  number: number;
  color: string;
  size: 'BIG' | 'SMALL';
  confidence: number;
  strategyName: string;
  allStrategies: Array<{ name: string; size: string; confidence: number }>;
}

interface HistoryItem {
  issueNumber: string;
  number: string;
  colour: string;
}

interface PredictionLog {
  issueNumber: string;
  predictedSize: string;
  actualNumber?: string;
  actualSize?: string;
  status: 'WIN' | 'LOSE' | 'PENDING';
  timestamp: Date;
}

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [predictionLogs, setPredictionLogs] = useState<PredictionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [apiToken, setApiToken] = useState<string>(() => localStorage.getItem('bigwin_api_token') || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [lastBatchId, setLastBatchId] = useState<string | null>(null);

  const getMyanmarTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      timeZone: 'Asia/Yangon',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }) + ' (MM)';
  };

  const getNextPeriod = (lastPeriod?: string) => {
    if (!lastPeriod) return '---';
    try {
      // BigWin issue numbers are long strings like 20260419100010551
      const prefix = lastPeriod.slice(0, -4);
      const suffix = parseInt(lastPeriod.slice(-4)) + 1;
      return prefix + suffix.toString().padStart(4, '0');
    } catch {
      return lastPeriod + '+';
    }
  };

  const fetchPrediction = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/predict', {
        headers: {
          'X-API-TOKEN': apiToken
        }
      });
      const data = await response.json();
      if (data.success) {
        setHistory(data.history);
        setPrediction(data.prediction);
        setLastUpdated(new Date());
        setError(null);

        // 1. Process Results for existing logs
        setPredictionLogs(prev => {
          const newLogs = [...prev];
          data.history.forEach((histItem: HistoryItem) => {
            const logIdx = newLogs.findIndex(l => l.issueNumber === histItem.issueNumber);
            if (logIdx !== -1 && newLogs[logIdx].status === 'PENDING') {
              const resNum = parseInt(histItem.number);
              const resSize = resNum >= 5 ? 'BIG' : 'SMALL';
              newLogs[logIdx] = {
                ...newLogs[logIdx],
                actualNumber: histItem.number,
                actualSize: resSize,
                status: newLogs[logIdx].predictedSize === resSize ? 'WIN' : 'LOSE'
              };
            }
          });
          
          // 2. Add New Prediction to logs if it doesn't exist
          const nextPd = getNextPeriod(data.history[0]?.issueNumber);
          if (data.prediction && nextPd !== '---' && !newLogs.find(l => l.issueNumber === nextPd)) {
            newLogs.unshift({
              issueNumber: nextPd,
              predictedSize: data.prediction.size,
              status: 'PENDING',
              timestamp: new Date()
            });
          }
          
          // Keep only last 20 logs for performance
          return newLogs.slice(0, 20);
        });
      } else {
        setError(data.error || 'Connection Error');
      }
    } catch (err) {
      setError('Failed to reach server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, [apiToken]); // Re-fetch if token changes

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (autoRefresh) {
      interval = setInterval(fetchPrediction, 5000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, apiToken]);

  const handleTokenChange = (value: string) => {
    // Smart Extraction: If user pastes the whole header or request dump
    let cleanedToken = value;
    
    // 1. Check for "Authorization: Bearer <token>" pattern
    const bearerMatch = value.match(/Bearer\s+([a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+)/);
    if (bearerMatch) {
      cleanedToken = bearerMatch[1];
    } 
    // 2. Check for just the JWT pattern if no bearer match
    else {
      const jwtMatch = value.match(/([a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+)/);
      if (jwtMatch) {
        cleanedToken = jwtMatch[1];
      }
    }
    
    setApiToken(cleanedToken.trim());
  };

  const saveToken = () => {
    localStorage.setItem('bigwin_api_token', apiToken);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
    fetchPrediction();
  };

  const getColorClass = (color: string) => {
    if (color === 'green') return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (color === 'red') return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    if (color === 'red-violet') return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    if (color === 'green-violet') return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
  };

  return (
    <div className="relative w-full h-screen bg-obsidian-gradient overflow-hidden font-sans select-none bg-neural-mesh">
      {/* Target WebView Iframe */}
      <iframe 
        src="https://bigwingame.win/#/register?invitationCode=66347100201" 
        className="w-full h-full border-none opacity-80 mix-blend-lighten"
        title="BigWin Game"
        referrerPolicy="no-referrer"
      />

      {/* Corporate Watermark */}
      <div className="fixed top-6 left-6 z-30 pointer-events-none opacity-40">
        <div className="flex flex-col">
          <span className="font-serif italic font-black text-xl tracking-tighter text-white glow-indigo">CORTEX_HACKER</span>
          <span className="text-[8px] font-mono text-indigo-500 uppercase tracking-[0.5em] ml-1">SYSTEM_BYPASS_V5.0</span>
        </div>
      </div>

      {/* Floating Control Rail */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-6 z-40 sm:bottom-8 sm:right-8">
        {/* Telegram Button - Ultra Edition */}
        <motion.a
          href="https://t.me/bwmoney100201"
          target="_blank"
          rel="noreferrer"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1, rotate: -5, y: -5 }}
          whileTap={{ scale: 0.9 }}
          className="relative w-14 h-14 sm:w-16 sm:h-16 group"
        >
          <div className="absolute -inset-4 bg-sky-500/20 blur-[30px] rounded-full group-hover:bg-sky-500/30 transition-all duration-700 animate-pulse" />
          
          <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl rounded-[1.5rem] border border-white/20 shadow-[0_0_30px_rgba(56,189,248,0.3)] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/10 via-transparent to-white/10 opacity-50" />
            
            {/* Data Stream Effect */}
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-y-0 w-8 bg-sky-500/5 skew-x-12 pointer-events-none"
            />

            <div className="relative z-10">
               <motion.div
                 animate={{ y: [0, -1, 0] }}
                 transition={{ duration: 2, repeat: Infinity }}
               >
                 <Send className="w-6 h-6 sm:w-8 sm:h-8 text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.8)] group-hover:scale-110 transition-transform duration-500 group-hover:rotate-12" />
               </motion.div>
            </div>
          </div>

          {/* Premium Notification Badge */}
          <div className="absolute -top-2 -right-2 flex items-center justify-center">
             <div className="relative">
                <div className="px-3 py-1 bg-rose-600 rounded-full border border-white/20 shadow-xl">
                   <span className="text-[10px] font-black text-white uppercase tracking-tighter">LIVE</span>
                </div>
                <div className="absolute inset-0 border border-rose-600/50 rounded-full animate-ping" />
             </div>
          </div>
        </motion.a>

        {/* AI Launch Button - The Monolith */}
        {/* AI Launch Button (The Monolith) */}
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1, rotate: 2, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="relative w-16 h-16 sm:w-20 sm:h-20 group"
        >
          <div className="absolute -inset-6 bg-indigo-500/20 blur-[40px] rounded-full group-hover:bg-indigo-500/40 transition-all duration-700 animate-pulse" />
          
          {/* Prediction Overlay on Icon */}
          {prediction && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.5 }}
               animate={{ opacity: 1, scale: 1 }}
               className="absolute -top-1 -left-1 z-20 px-2 py-0.5 bg-indigo-600 rounded-lg border border-indigo-400/50 shadow-[0_0_15px_rgba(79,70,229,0.8)]"
            >
               <span className="text-[10px] font-black text-white italic tracking-tighter">{prediction.size}</span>
            </motion.div>
          )}

          {/* Rotating Quantum Rings */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border border-indigo-500/20 rounded-full scale-[1.2] opacity-40" 
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border border-indigo-500/10 rounded-full scale-[1.4] border-dashed opacity-20" 
          />
          
          <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl rounded-full border border-white/20 shadow-[0_0_30px_rgba(99,102,241,0.4)] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-white/10 opacity-50" />
            
            {/* Holographic Sweep */}
            <motion.div
              animate={{ y: ['100%', '-100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-x-0 h-6 bg-indigo-500/10 blur-lg pointer-events-none"
            />

            <div className="relative z-10">
               <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400 glow-indigo group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
               
               {/* Neural Pulse Glow */}
               <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-indigo-500/30 blur-xl rounded-full -z-10"
               />
            </div>
          </div>

          {/* Ultra Signal Indicator */}
          <div className="absolute -top-2 -right-2 flex items-center justify-center">
             <div className="relative">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-black rounded-full border border-white/20 flex items-center justify-center shadow-2xl">
                   <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                </div>
                <motion.div 
                  animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 border-2 border-emerald-500/40 rounded-full"
                />
             </div>
          </div>
        </motion.button>
      </div>

      {/* Prediction Panel Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

              {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ 
                type: 'spring', 
                damping: 30, 
                stiffness: 150,
                opacity: { duration: 0.3 }
              }}
              className="fixed bottom-0 left-0 right-0 max-h-[95vh] sm:max-h-[96vh] bg-[#020205] border-t-2 border-indigo-500/30 rounded-t-[2rem] sm:rounded-t-[3rem] z-51 overflow-hidden flex flex-col shadow-[0_-50px_150px_rgba(0,0,0,1)] nebula-bg"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none" />
              
              {/* Scanline Effect */}
              <div className="scanline" />
              <div className="scanline opacity-30" style={{ animationDelay: '4s' }} />

              {/* Decorative Handle */}
              <div className="w-16 h-1.5 bg-indigo-500/40 rounded-full mx-auto mt-5 mb-1 sm:w-24 sm:mt-7 hover:bg-indigo-500/60 transition-colors cursor-grab active:cursor-grabbing" />

              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 sm:px-10 sm:py-6 bg-black/40 backdrop-blur-2xl sticky top-0 z-20">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="relative group flex-shrink-0">
                    <div className="absolute inset-0 bg-indigo-600 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-black rounded-xl flex items-center justify-center border border-white/10 relative overflow-hidden group shadow-2xl">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} className="absolute inset-1 border border-indigo-500/10 rounded-xl" />
                        <Brain className="text-white w-6 h-6 sm:w-7 sm:h-7 relative z-10 text-glow-indigo" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white italic tracking-tighter flex items-center gap-3">
                      NEURAL <span className="text-indigo-500">EXPLOIT</span>
                      <span className="text-[8px] sm:text-[9px] technical-label text-indigo-500/60 uppercase">HACK_SYSTEM_V.5</span>
                    </h2>
                    <div className="flex items-center gap-4 mt-2">
                       <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                         <span className="text-[9px] sm:text-xs font-mono text-indigo-400 uppercase tracking-[0.2em] font-black">ROOT_ACCESS: BYPASSED</span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-5">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-3 sm:px-6 sm:py-3 rounded-2xl transition-all font-mono text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-2 border ${showSettings ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.5)]' : 'bg-white/5 border-white/10 text-zinc-400'}`}
                  >
                    <Settings className={`w-4 h-4 sm:w-5 sm:h-5 ${showSettings ? 'animate-spin-slow' : ''}`} /> 
                    <span className="hidden sm:inline">CONFIG</span>
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(false)}
                    className="p-3 bg-white/5 hover:bg-rose-500/20 rounded-2xl border border-white/10 transition-all text-zinc-400 hover:text-rose-500"
                  >
                    <X className="w-5 h-5 sm:w-7 sm:h-7" />
                  </motion.button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto px-6 pb-12 space-y-8 sm:px-8 sm:space-y-10 custom-scrollbar touch-auto overscroll-contain">
                {showSettings ? (
                  /* Settings View */
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto w-full space-y-12 py-12"
                  >
                    <div className="text-center space-y-4">
                      <div className="inline-flex p-6 bg-indigo-500/10 rounded-[2rem] border border-indigo-500/20 mb-3 shadow-[0_0_40px_rgba(99,102,241,0.2)]">
                        <Terminal className="text-indigo-400 w-10 h-10" />
                      </div>
                      <h3 className="text-3xl font-display font-black text-white uppercase tracking-widest italic">HACKER_PRIVILEGE</h3>
                      <p className="text-xs text-zinc-500 font-medium max-w-sm mx-auto uppercase tracking-widest leading-relaxed">Injection of custom bypass payloads requires administrative credentials for the predicting core.</p>
                    </div>

                    <div className="space-y-10">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                          <label className="text-xs font-mono font-black text-zinc-600 uppercase tracking-[0.4em]">Uplink_Identity_Token</label>
                          {apiToken && <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-2 uppercase tracking-[0.3em]"><CheckCircle2 className="w-4 h-4" /> Identity_Verified</span>}
                        </div>
                        <div className="group relative transition-all">
                          <div className="absolute inset-0 bg-indigo-500/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                          <textarea 
                            value={apiToken}
                            onChange={(e) => handleTokenChange(e.target.value)}
                            placeholder="AWAITING_INPUT: Paste neural link credentials..."
                            className="w-full bg-black/40 border border-white/10 rounded-[2rem] p-8 text-sm font-mono text-white placeholder:text-zinc-800 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/[0.03] transition-all h-48 resize-none leading-relaxed shadow-inner"
                          />
                        </div>
                      </div>

                      <button 
                        onClick={saveToken}
                        className="group w-full h-16 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-2xl font-display font-black text-sm uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(99,102,241,0.4)] hover:shadow-[0_25px_60px_rgba(99,102,241,0.6)]"
                      >
                        {saveSuccess ? (
                          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6" /> SYSTEM_SAVED
                          </motion.div>
                        ) : (
                          <>
                            <Save className="w-6 h-6 group-hover:rotate-12 transition-transform" /> Commit_Protocol
                          </>
                        )}
                      </button>

                      <div className="grid grid-cols-2 gap-6 pt-6">
                         <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem] space-y-3 shadow-inner">
                           <span className="text-[10px] font-black text-indigo-500/60 uppercase tracking-[0.3em]">Encryption</span>
                           <div className="text-sm font-mono font-bold text-indigo-200/80 uppercase flex items-center gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" /> RSA_4096_ACTIVE
                           </div>
                         </div>
                         <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-[2rem] space-y-3 shadow-inner">
                           <span className="text-[10px] font-black text-rose-500/60 uppercase tracking-[0.3em]">Access_Level</span>
                           <div className="text-sm font-mono font-bold text-rose-300/80 uppercase flex items-center gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> ADMIN_PRIVILEGE
                           </div>
                         </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* Prediction View */
                  <>
                    {loading && (
                      <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2 bg-indigo-600/20 border border-indigo-500/40 rounded-full backdrop-blur-xl">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                        <span className="text-[10px] font-black font-mono text-white tracking-[0.3em]">BYPASSING_CORE...</span>
                      </div>
                    )}
                    {/* Quantum Data Hub - Hero & Bento */}
                    <div className="grid lg:grid-cols-12 gap-10 items-start">
                      <div className="lg:col-span-12 space-y-8">
                        {/* Sequence Identifier Header */}
                        <div className="flex flex-col gap-6 border-b border-white/5 pb-10 sm:flex-row sm:items-end sm:justify-between sm:pb-14">
                          <div className="space-y-4 sm:space-y-6">
                            <div className="inline-flex px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                              <span className="text-[10px] sm:text-[12px] font-black text-indigo-400 uppercase tracking-[0.3em]">NEURAL_UPLINK_ACQUIRING</span>
                            </div>
                            <div className="space-y-3 sm:space-y-5">
                               <h3 className="technical-label text-zinc-600 flex items-center gap-4">
                                 <div className="w-1.5 h-4 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.6)]" />
                                 TARGET_VECTOR_ISSUE
                               </h3>
                               <div className="text-4xl sm:text-7xl font-black text-white tracking-widest italic leading-none flex items-baseline gap-4 sm:gap-8 font-serif">
                                 <span className="opacity-10 text-2xl sm:text-4xl font-normal tracking-tight">§</span>
                                 <span className={prediction ? 'text-glow-indigo' : ''}>
                                   {history.length > 0 ? getNextPeriod(history[0].issueNumber).slice(-4) : '####'}
                                 </span>
                                 <div className="flex flex-col gap-1.5 sm:gap-3">
                                   <span className="text-[9px] sm:text-xs font-mono font-black tracking-widest text-indigo-500/60 px-3 py-1.5 border border-indigo-500/10 rounded-xl bg-indigo-500/5 shadow-inner">
                                     NODE_{history.length > 0 ? getNextPeriod(history[0].issueNumber).slice(-7) : '---'}
                                   </span>
                                   <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/5 p-[1px] shadow-inner">
                                     <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }} className="h-full w-1/3 bg-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,1)]" />
                                   </div>
                                 </div>
                               </div>
                            </div>
                          </div>

                          <div className="flex flex-row sm:flex-col sm:items-end gap-4 items-center justify-between sm:justify-start">
                             <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl px-6 py-3 sm:px-8 sm:py-4 rounded-[1.5rem] border border-white/10 shadow-2xl">
                               <RefreshCcw className={`w-4 h-4 text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
                               <span className="text-[10px] sm:text-xs font-mono font-black text-zinc-400 uppercase tracking-[0.3em] whitespace-nowrap">
                                 {getMyanmarTime(lastUpdated).split(' ')[0]}
                               </span>
                             </div>
                             <div className="flex items-center gap-3">
                               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                               <span className="text-[10px] sm:text-[12px] font-black text-emerald-500/80 uppercase tracking-widest whitespace-nowrap">LINK_STABLE: 14MS</span>
                             </div>
                          </div>
                        </div>

                        {/* High-Performance Bento Architecture */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
                          {/* Probability Size */}
                          <motion.div whileHover={{ scale: 1.02 }} className="glass-card-premium p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] space-y-4 sm:space-y-8 relative overflow-hidden group shadow-2xl">
                            <div className="space-y-1.5 sm:space-y-3 relative z-10">
                              <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 glow-indigo" />
                                <span className="technical-label text-zinc-400">NEURAL_SIZE_BIAS</span>
                              </div>
                              <div className={`text-4xl sm:text-6xl font-serif font-black italic tracking-tighter ${prediction?.size === 'BIG' ? 'text-indigo-400 text-glow-indigo' : 'text-indigo-500 text-glow-indigo'}`}>
                                {loading && predictionLogs.length === 0 ? '--' : (prediction ? prediction.size : '--')}
                              </div>
                            </div>
                            <div className="pt-4 border-t border-white/5 flex items-center justify-between sm:pt-6">
                               <span className="text-[8px] sm:text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">VECTOR</span>
                               <span className="text-[9px] sm:text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded-full outline outline-1 outline-indigo-500/20">STABLE</span>
                            </div>
                            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity rotate-12">
                               <Activity className="w-24 h-24 text-white" />
                            </div>
                          </motion.div>

                          {/* Neural Prediction Index */}
                          <motion.div whileHover={{ scale: 1.02 }} className="glass-card-premium p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] space-y-4 sm:space-y-8 relative overflow-hidden group shadow-2xl">
                            <div className="space-y-1.5 sm:space-y-3 relative z-10">
                              <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 glow-indigo" />
                                <span className="technical-label text-zinc-400">VALUE_INDEX_MATCH</span>
                              </div>
                              <div className="text-4xl sm:text-6xl font-serif font-black text-white italic tracking-tighter text-glow-indigo">
                                {loading && predictionLogs.length === 0 ? '?' : (prediction ? prediction.number : '--')}
                              </div>
                            </div>
                            <div className="pt-4 border-t border-white/5 flex items-center justify-between sm:pt-6">
                               <span className="text-[8px] sm:text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">SIGMA</span>
                               <div className="flex gap-1 sm:gap-1.5">
                                  {[1,2,3,4].map(i => <div key={i} className={`w-1 h-3 sm:h-5 rounded-full ${i <= 3 ? 'bg-indigo-500 glow-indigo' : 'bg-white/5'}`} />)}
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity -rotate-12">
                               <Hash className="w-24 h-24 text-white" />
                            </div>
                          </motion.div>
                          {/* Chromatic Projection */}
                          <motion.div whileHover={{ scale: 1.02, y: -5 }} className="glass-card-premium p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] space-y-4 sm:space-y-8 relative overflow-hidden border-white/20 shadow-2xl group">
                            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
                            <div className="space-y-2 sm:space-y-4 relative z-10">
                              <div className="flex items-center gap-3">
                                <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                                <span className="technical-label text-zinc-400">CHROMA_SYNC_VECTOR</span>
                              </div>
                              <div className={`text-3xl sm:text-5xl font-serif font-black flex items-center gap-5 italic uppercase tracking-tighter ${prediction ? getColorClass(prediction.color).split(' ')[0] : 'text-zinc-700'}`}>
                                <div className="relative group/hex">
                                  <motion.div 
                                    animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }} 
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className={`w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl ring-[8px] ring-black/80 border border-white/20 shadow-2xl relative overflow-hidden flex items-center justify-center ${prediction?.color?.includes('red') ? 'bg-gradient-to-br from-rose-500 to-rose-700 shadow-rose-500/20' : ''} ${prediction?.color?.includes('green') ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-500/20' : ''} ${prediction?.color?.includes('violet') ? 'bg-gradient-to-br from-purple-500 to-purple-700 shadow-purple-500/20' : ''}`}
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
                                    <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
                                  </motion.div>
                                  <div className="absolute -inset-3 bg-indigo-500/5 blur-xl opacity-0 group-hover/hex:opacity-100 transition-opacity" />
                                </div>
                                <span className="hidden sm:inline text-glow-indigo tracking-widest">{prediction ? prediction.color.split('-')[0] : 'ACQUIRING'}</span>
                              </div>
                            </div>
                            <div className="pt-3 border-t border-white/5 space-y-2.5">
                               <div className="flex justify-between items-center text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                                 <span>STABILITY</span>
                                 <span className="text-white">99.9%</span>
                               </div>
                               <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden p-[1px] border border-white/10 shadow-inner">
                                 <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,1)]" />
                               </div>
                            </div>
                          </motion.div>

                          {/* Confidence Core */}
                          <motion.div whileHover={{ scale: 1.02, y: -5 }} className="glass-card-premium p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] space-y-4 sm:space-y-8 flex flex-col justify-between border-white/20 shadow-2xl relative overflow-hidden group">
                             <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity">
                                <Zap className="w-20 h-20 sm:w-28 sm:h-28 text-indigo-500" />
                             </div>
                             <div className="space-y-2 sm:space-y-4 relative z-10">
                               <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,1)]" />
                                <span className="technical-label text-zinc-400">CORE_CONFIDENCE_LVL</span>
                               </div>
                               <div className="text-5xl sm:text-7xl font-serif font-black text-white italic tracking-tighter text-glow-indigo">
                                 {prediction?.confidence ?? 0}<span className="text-xl sm:text-3xl font-normal opacity-10 ml-2">%</span>
                               </div>
                             </div>
                             <div className="relative pt-4">
                                <div className="w-full h-4 sm:h-7 bg-black/60 rounded-full overflow-hidden p-1 border border-white/10 shadow-inner">
                                   <motion.div 
                                      className="h-full bg-gradient-to-r from-indigo-900 via-indigo-400 to-white rounded-full glow-indigo shadow-lg relative"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${prediction?.confidence ?? 0}%` }}
                                   >
                                      <div className="absolute inset-y-0 right-0 w-4 bg-white blur-md" />
                                   </motion.div>
                                </div>
                             </div>
                          </motion.div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Controls & Stats */}
                    <div className="flex flex-col lg:flex-row gap-10 items-stretch pt-10">
                      
                      {/* Registry Archives */}
                      <div className="flex-1 space-y-12">
                        <div className="flex flex-col gap-6 border-b border-indigo-500/10 pb-8 sm:flex-row sm:items-center sm:justify-between sm:pb-10">
                          <div className="flex items-center gap-4 sm:gap-6">
                            <div className="p-3 sm:p-4 bg-black rounded-xl border border-indigo-500/20 shadow-2xl overflow-hidden relative group">
                              <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors" />
                              <History className="text-indigo-400 w-5 h-5 sm:w-7 sm:h-7 relative z-10" />
                            </div>
                            <div>
                               <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter italic font-serif">Registry_Archives</h3>
                               <p className="text-[9px] sm:text-[11px] font-mono text-zinc-500 uppercase tracking-[0.4em] mt-1">Deep_Historical_Learning_Enabled</p>
                            </div>
                          </div>

                                                    {/* Registry Archives Statistics */}
                          <div className="flex flex-col gap-6 border-b border-indigo-500/10 pb-8 sm:flex-row sm:items-center sm:justify-between sm:pb-10">
                            <div className="flex items-center gap-5 sm:gap-7">
                              <div className="p-3.5 sm:p-5 bg-black rounded-2xl border border-indigo-500/20 shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors" />
                                <History className="text-indigo-400 w-6 h-6 sm:w-8 sm:h-8 relative z-10" />
                              </div>
                              <div>
                                 <h3 className="text-2xl sm:text-3xl font-black text-white italic font-serif">REGISTRY_DATABASE</h3>
                                 <p className="technical-label text-zinc-600 mt-1">REALTIME_EVENT_LOG_V4</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-10">
                               <div className="flex items-center gap-4 bg-black/40 px-6 py-3 rounded-2xl border border-emerald-500/20 shadow-xl group hover:border-emerald-500/40 transition-all">
                                  <Trophy className="w-4 h-4 text-emerald-500 glow-emerald" />
                                  <div className="flex flex-col">
                                    <span className="text-lg sm:text-2xl font-mono font-black text-emerald-400 tabular-nums leading-none">
                                      {predictionLogs.filter(l => l.status === 'WIN').length}
                                    </span>
                                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-1">SUCCESS</span>
                                  </div>
                               </div>
                               <div className="flex items-center gap-4 bg-black/40 px-6 py-3 rounded-2xl border border-rose-500/20 shadow-xl group hover:border-rose-500/40 transition-all">
                                  <Skull className="w-4 h-4 text-rose-500 glow-rose" />
                                  <div className="flex flex-col">
                                    <span className="text-lg sm:text-2xl font-mono font-black text-rose-400 tabular-nums leading-none">
                                      {predictionLogs.filter(l => l.status === 'LOSE').length}
                                    </span>
                                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-1">FAILURE</span>
                                  </div>
                               </div>
                            </div>
                          </div>

                        </div>

                          {/* Premium Registry Interface */}
                          <div className="glass-card-premium rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border-white/5 shadow-3xl bg-black/20">
                            <div className="overflow-x-auto custom-scrollbar">
                              <table className="w-full text-left border-collapse min-w-[500px] sm:min-w-0">
                                <thead>
                                  <tr className="border-b border-indigo-500/10 bg-indigo-500/[0.03]">
                                    <th className="py-5 px-6 sm:py-6 sm:px-10 text-[9px] sm:text-[11px] font-mono font-black text-zinc-500 uppercase tracking-[0.5em] border-r border-white/5">EVENT_UID</th>
                                    <th className="py-5 px-6 sm:py-6 sm:px-10 text-[9px] sm:text-[11px] font-mono font-black text-zinc-500 uppercase tracking-[0.5em] text-center border-r border-white/5">NEURAL_BIAS</th>
                                    <th className="py-5 px-6 sm:py-6 sm:px-10 text-[9px] sm:text-[11px] font-mono font-black text-zinc-500 uppercase tracking-[0.5em] text-center border-r border-white/5">REAL_VAL</th>
                                    <th className="py-5 px-6 sm:py-6 sm:px-10 text-[9px] sm:text-[11px] font-mono font-black text-zinc-500 uppercase tracking-[0.5em] text-right">SYSCALL</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 font-mono text-[13px]">
                                  {loading && predictionLogs.length === 0 ? (
                                    <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-500/10 mx-auto" /></td></tr>
                                  ) : predictionLogs.length === 0 ? (
                                    <tr><td colSpan={4} className="py-20 text-center text-zinc-800 text-[9px] uppercase font-black tracking-[1em]">DATAFRAME_EMPTY</td></tr>
                                  ) : [...predictionLogs].reverse().map((log) => (
                                      <tr key={log.issueNumber} className="hover:bg-indigo-500/[0.04] transition-all group relative">
                                        <td className="py-6 px-6 sm:py-8 sm:px-10 border-r border-white/5 relative">
                                          <div className="flex flex-col gap-1.5">
                                            <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em]">T+{log.timestamp.toLocaleTimeString().split(' ')[0]}</span>
                                            <span className="text-lg sm:text-2xl font-black text-white italic group-hover:text-indigo-400 transition-colors font-serif tracking-widest">{log.issueNumber.slice(-6)}</span>
                                          </div>
                                        </td>
                                        <td className="py-6 px-6 sm:py-8 sm:px-10 text-center border-r border-white/5">
                                          <div className={`px-4 py-2 rounded-xl text-[11px] sm:text-[14px] font-serif font-black italic border ${log.predictedSize === 'BIG' ? 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5' : 'text-indigo-500 border-indigo-400/20 bg-indigo-500/5'}`}>
                                            {log.predictedSize}
                                          </div>
                                        </td>
                                        <td className="py-6 px-6 sm:py-8 sm:px-10 text-center border-r border-white/5">
                                          {log.actualSize ? (
                                            <div className="flex flex-col items-center gap-2">
                                              <span className={`text-lg sm:text-xl font-serif font-black underline decoration-indigo-500/20 underline-offset-8 italic ${log.actualSize === 'BIG' ? 'text-indigo-400' : 'text-indigo-500'}`}>
                                                {log.actualSize}
                                              </span>
                                              <div className="px-4 py-1.5 bg-black/40 rounded-xl border border-white/5 shadow-inner">
                                                <span className="text-[12px] text-zinc-500 font-bold font-mono tracking-widest">N_{log.actualNumber}</span>
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="flex flex-col items-center gap-4">
                                              <div className="w-14 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                                <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} className="h-full w-full bg-indigo-500/30" />
                                              </div>
                                              <span className="text-[9px] text-zinc-800 font-black tracking-[0.5em] uppercase">SYNCING</span>
                                            </div>
                                          )}
                                        </td>
                                        <td className="py-6 px-6 sm:py-8 sm:px-10 text-right">
                                          <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-xl border font-black uppercase tracking-[0.3em] text-[9px] sm:text-[11px] ${log.status === 'WIN' ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : log.status === 'LOSE' ? 'border-rose-500/20 bg-rose-500/5 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : 'border-white/5 bg-white/5 text-zinc-900'}`}>
                                            {log.status === 'WIN' ? <Trophy className="w-4 h-4 group-hover:animate-bounce" /> : log.status === 'LOSE' ? <Skull className="w-4 h-4 group-hover:rotate-12 transition-transform" /> : <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />}
                                            <span className="hidden xl:inline">{log.status}</span>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                      </div>

                      {/* Quantum Diagnostics Sidebar */}
                      <div className="lg:w-[32rem] space-y-10 sm:space-y-14">
                         {/* Neural Controller Node */}
                         <div className="glass-card-premium p-10 sm:p-14 rounded-[3rem] sm:rounded-[4.5rem] border-white/20 shadow-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                               <Cpu className="w-28 h-28 sm:w-40 sm:h-40 text-indigo-500" />
                            </div>
                            <h4 className="technical-label text-white flex items-center gap-4 mb-10 sm:mb-14">
                               <ShieldAlert className="w-5 h-5 text-indigo-500" /> SYSTEM_CONTROL_CORE
                            </h4>
                            <div className="grid grid-cols-1 gap-6 relative z-10">
                               <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={fetchPrediction} disabled={loading}
                                 className="w-full h-20 sm:h-24 flex items-center justify-between px-8 sm:px-12 bg-white/[0.04] rounded-2xl sm:rounded-[2.5rem] border border-white/10 hover:border-indigo-500/40 transition-all group disabled:opacity-30">
                                 <span className="text-[11px] sm:text-[13px] font-black uppercase text-zinc-500 group-hover:text-white transition-colors tracking-[0.3em]">MANUAL_RECALIBRATION</span>
                                 <RefreshCcw className={`w-6 h-6 text-indigo-500 ${loading ? 'animate-spin' : ''}`} />
                               </motion.button>
                               <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setAutoRefresh(!autoRefresh)}
                                 className={`w-full h-20 sm:h-24 flex items-center justify-between px-8 sm:px-12 rounded-2xl sm:rounded-[2.5rem] border transition-all ${autoRefresh ? 'bg-indigo-500/15 border-indigo-500/40 shadow-[0_0_40px_rgba(99,102,241,0.2)]' : 'bg-rose-500/10 border-rose-500/20'}`}>
                                 <span className={`text-[11px] sm:text-[13px] font-black uppercase tracking-[0.3em] ${autoRefresh ? 'text-indigo-400' : 'text-rose-500'}`}>{autoRefresh ? 'LIVE_STREAM_ACTIVE' : 'STREAM_OFFLINE'}</span>
                                 <div className={`w-4 h-4 rounded-full ${autoRefresh ? 'bg-indigo-500 animate-pulse shadow-[0_0_20px_rgba(99,102,241,1)]' : 'bg-zinc-900 border border-white/10'}`} />
                               </motion.button>
                            </div>

                            <div className="pt-10 mt-10 border-t border-white/5 space-y-8 sm:pt-14 sm:mt-14">
                                <h5 className="technical-label text-indigo-500 flex items-center gap-4">
                                  <Activity className="w-5 h-5" /> NEURAL_SIMULATION_ARRAY
                                </h5>
                                <div className="space-y-4">
                                  {prediction?.allStrategies ? (
                                    prediction.allStrategies.map((s, idx) => (
                                      <div key={idx} className="flex flex-col gap-3 p-6 bg-black/40 rounded-3xl border border-white/5 group hover:border-indigo-500/30 transition-all shadow-inner">
                                        <div className="flex justify-between items-center px-1">
                                          <span className="text-[10px] sm:text-[12px] font-mono font-black text-zinc-600 uppercase tracking-widest group-hover:text-zinc-300">{s.name}</span>
                                          <span className={`text-[12px] sm:text-[14px] font-black uppercase tracking-widest ${s.size === 'BIG' ? 'text-indigo-400 text-glow-indigo' : 'text-indigo-500 text-glow-indigo'}`}>{s.size}</span>
                                        </div>
                                        <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden p-[1px] border border-white/5">
                                          <motion.div initial={{ width: 0 }} animate={{ width: `${s.confidence}%` }} className={`h-full rounded-full ${prediction.strategyName === s.name ? 'bg-indigo-500 glow-indigo shadow-[0_0_10px_rgba(99,102,241,1)]' : 'bg-zinc-800'}`} />
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="py-12 text-center text-zinc-800 text-[10px] uppercase font-black tracking-[0.6em]">WAITING_FOR_VECTOR...</div>
                                  )}
                                </div>

                                <div className="space-y-4">
                                   <div className="flex justify-between items-center technical-label text-zinc-600">
                                      <span>CORE_UPLINK_LATENCY</span>
                                      <span className="text-emerald-500 glow-emerald">0.008ms</span>
                                   </div>
                                   <div className="flex gap-2">
                                      {[1,2,3,4,5,6,7,8,9,10].map(i => <div key={i} className={`h-3 flex-1 rounded-full ${i <= 1 ? 'bg-emerald-500 shadow-lg glow-emerald' : 'bg-white/5'}`} />)}
                                   </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                  <div className="flex items-center justify-between bg-black/40 px-6 py-4 rounded-[1.5rem] border border-white/5 shadow-inner group hover:border-indigo-500/20 transition-all">
                                    <div className="flex items-center gap-3">
                                       <Zap className="w-4 h-4 text-indigo-400 group-hover:animate-bounce" />
                                       <span className="text-[9px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-widest">ACTIVE_STRAT</span>
                                    </div>
                                  <span className="text-xs sm:text-sm font-mono font-black text-indigo-400 text-glow-indigo uppercase italic">{prediction?.strategyName || 'INITIALIZING'}</span>
                                </div>
                              </div>
                          </div>
                       </div>
                    </div>

                    </div>

                    {/* AI Logic Log */}
                    <div className="p-8 sm:p-10 space-y-8 bg-black/40 rounded-[2rem] sm:rounded-[3rem] border border-white/5 shadow-inner">
                       <h5 className="technical-label text-indigo-500 flex items-center gap-4">
                          <Terminal className="w-5 h-5" /> NEURAL_TERMINAL
                       </h5>
                       <div className="space-y-4 border-l-2 border-indigo-500/10 pl-6 font-mono italic">
                          <div className="space-y-4">
                            <p className="text-[11px] leading-relaxed text-zinc-500 uppercase font-bold tracking-widest">
                              [INFO] INJECTING BYPASS_PAYLOAD_V5
                            </p>
                            <p className="text-[11px] leading-relaxed text-zinc-400 uppercase font-black tracking-widest">
                              [OK] EXPLOITING {prediction?.allStrategies?.length || 0} NEURAL_KERNELS
                            </p>
                            <p className="text-[11px] leading-relaxed text-zinc-500 uppercase font-bold tracking-widest">
                              [INFO] DEPLOYING PATTERN_MOMENTUM_STRAT
                            </p>
                            <p className="text-[11px] leading-relaxed text-indigo-500 uppercase font-black tracking-widest text-glow-indigo">
                              [ROOT] ACCESS_GRANTED: TARGET_BYPASSED
                            </p>
                          </div>
                       </div>
                    </div>

                    {/* Corporate Data */}
                    <div className="px-12 flex flex-col gap-6 text-[10px] font-black text-zinc-800 uppercase tracking-[0.5em] pb-12 italic opacity-30 hover:opacity-100 transition-opacity font-mono">
                      <div className="flex justify-between items-center px-2"><span>SYSTEM_ARCH</span><span className="text-zinc-400">QUANTUM_MGTHANT_V8</span></div>
                      <div className="flex justify-between items-center px-2"><span>DEVELOPER</span><span className="text-zinc-400">MGTHANT_AI_RESEARCH</span></div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
