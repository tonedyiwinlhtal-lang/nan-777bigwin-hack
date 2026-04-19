import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, X, BarChart3, History, RefreshCcw, Wifi, WifiOff, Loader2, Settings, Key, Save, CheckCircle2, Send, Trophy, Skull, Brain, Cpu, Zap, Activity } from 'lucide-react';

interface Prediction {
  number: number;
  color: string;
  size: 'BIG' | 'SMALL';
  confidence: number;
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
  const [apiToken, setApiToken] = useState<string>(() => localStorage.getItem('bigwin_api_token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOiIxNzc2NjA3NjMyIiwibmJmIjoiMTc3NjYwNzYzMiIsImV4cCI6IjE3NzY2MDk0MzIiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL2V4cGlyYXRpb24iOiI0LzE5LzIwMjYgOTowNzoxMiBQTSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkFjY2Vzc19Ub2tlbiIsIlVzZXJJZCI6IjYzMjIwMyIsIlVzZXJOYW1lIjoiOTU5NzUzNjE5ODc4IiwiVXNlclBob3RvIjoiMSIsIk5pY2tOYW1lIjoiTWVtYmVyTk5HRU1MQTYiLCJBbW91bnQiOiIwLjg5IiwiSW50ZWdyYWwiOiIwIiwiTG9naW5NYXJrIjoiSDUiLCJMb2dpblRpbWUiOiI0LzE5LzIwMjYgODozNzoxMiBQTSIsIkxvZ2luSVBBZGRyZXNzIjoiNDMuMjE3LjE0OS4xNDAiLCJEYk51bWJlciI6IjAiLCJJc3ZhbGlkYXRvciI6IjAiLCJLZXlDb2RlIjoiMTU0IiwiVG9rZW5UeXBlIjoiQWNjZXNzX1Rva2VuIiwiUGhvbmVUeXBlIjoiMSIsIlVzZXJUeXBlIjoiMCIsIlVzZXJOYW1lMiI6IiIsImlzcyI6Imp3dElzc3VlciIsImF1ZCI6ImxvdHRlcnlUaWNrZXQifQ.Z9-NERVSAsKW05EWPSKHz3pkOwdoKGA15Fo4CwCuBZM');
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
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden font-sans select-none">
      {/* Target WebView Iframe */}
      <iframe 
        src="https://bigwingame.win/#/register?invitationCode=66347100201" 
        className="w-full h-full border-none opacity-90"
        title="BigWin Game"
        referrerPolicy="no-referrer"
      />

      {/* Floating Control Rail */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-40 sm:bottom-8 sm:right-8 sm:gap-5">
        {/* Telegram Button */}
        <motion.a
          href="https://t.me/bwmoney100201"
          target="_blank"
          rel="noreferrer"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1, y: -5 }}
          whileTap={{ scale: 0.9 }}
          className="w-12 h-12 sm:w-14 sm:h-14 glass-quantum flex items-center justify-center rounded-2xl shadow-indigo-500/10 border-white/10 transition-all hover:bg-indigo-500/20 group backdrop-blur-md"
        >
          <Send className="text-indigo-400 w-5 h-5 sm:w-6 sm:h-6 rotate-[15deg] fill-indigo-400/10 group-hover:fill-indigo-400/20" />
        </motion.a>

        {/* AI Launch Button (Brain Icon) */}
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            delay: 0.1, 
            type: 'spring', 
            damping: 15,
            stiffness: 200
          }}
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 sm:w-24 sm:h-24 bg-[#050505] rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center border border-white/20 cursor-pointer relative group overflow-hidden shadow-[0_0_60px_rgba(99,102,241,0.3)]"
        >
          {/* Animated Background Gradients */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-rose-500/20" />
          
          {/* Rotating Quantum Rings */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 border-2 border-dashed border-indigo-500/20 rounded-[1.8rem] sm:rounded-[2.2rem]"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 border border-indigo-500/10 rounded-[1.5rem] sm:rounded-[2rem]"
          />

          {/* Holographic Sweep Effect */}
          <motion.div
            animate={{ 
              left: ['-100%', '200%'],
              opacity: [0, 0.5, 0] 
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              repeatDelay: 2,
              ease: "easeInOut"
            }}
            className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 z-10"
          />

          {/* Neural Pulse Glow */}
          <div className="absolute inset-0 bg-radial-glow opacity-30 group-hover:opacity-50 transition-opacity" />

          {/* The Core Icon */}
          <div className="relative z-20">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                filter: [
                  'drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))',
                  'drop-shadow(0 0 15px rgba(99, 102, 241, 0.8))',
                  'drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Brain className="text-white w-8 h-8 sm:w-11 sm:h-11 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
            </motion.div>
          </div>

          {/* Signal Indicator */}
          <span className="absolute top-3 right-3 sm:top-5 sm:right-5 flex h-3 w-3 sm:h-4 sm:w-4 z-30">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 sm:h-4 sm:w-4 bg-indigo-500 border border-white/20"></span>
          </span>
          
          {/* Scanline pattern for the button */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
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
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-h-[92vh] sm:max-h-[96vh] glass-quantum border-t border-white/20 rounded-t-[2.5rem] sm:rounded-t-[3.5rem] z-51 overflow-hidden flex flex-col shadow-[0_-20px_100px_rgba(0,0,0,0.9)] nebula-bg touch-none"
            >
              {/* Scanline Effect */}
              <div className="scanline" />

              {/* Decorative Handle */}
              <div className="w-12 h-1.5 bg-indigo-500/20 rounded-full mx-auto mt-4 mb-1 sm:w-20 sm:mt-6" />

              {/* Header */}
              <div className="px-6 py-6 sm:px-12 sm:py-10 flex items-center justify-between sticky top-0 bg-transparent z-10 backdrop-blur-md">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="relative group flex-shrink-0">
                    <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 sm:blur-2xl" />
                    <div className="relative p-3 sm:p-5 bg-indigo-500/10 rounded-2xl sm:rounded-3xl border border-indigo-400/30 glow-indigo">
                      <Cpu className="text-indigo-400 w-6 h-6 sm:w-10 sm:h-10" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-4xl font-display font-black text-white tracking-tight flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 truncate">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-400">QUANTUM_LAB</span>
                      <span className="text-[8px] sm:text-xs text-indigo-500/40 font-mono font-bold tracking-[0.3em] px-2 py-0.5 border border-indigo-500/10 rounded-full w-fit">CORE_V2</span>
                    </h2>
                    <div className="flex items-center gap-3 sm:gap-6 mt-1 sm:mt-3">
                       <div className="flex items-center gap-2 sm:gap-3">
                         <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,1)]" />
                         <span className="text-[8px] sm:text-xs text-indigo-400 font-mono font-black uppercase tracking-widest sm:tracking-[0.3em]">Synapse_Ready</span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-5">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-3 sm:px-6 sm:py-3 rounded-2xl transition-all font-mono text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-2 border ${showSettings ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-white/5 border-white/10 text-zinc-400'}`}
                  >
                    <Settings className={`w-4 h-4 sm:w-5 sm:h-5 ${showSettings ? 'animate-spin-slow' : ''}`} /> 
                    <span className="hidden sm:inline">{showSettings ? 'TERMINATE_CONFIG' : 'ACCESS_CONFIG'}</span>
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
                        <Key className="text-indigo-400 w-10 h-10" />
                      </div>
                      <h3 className="text-3xl font-display font-black text-white uppercase tracking-widest italic">CORTEX_AUTHORIZATION</h3>
                      <p className="text-xs text-zinc-500 font-medium max-w-sm mx-auto uppercase tracking-widest leading-relaxed">System requires signed JWT or Bearer token to establish neural uplink with the predictor core.</p>
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
                    {/* Quantum Data Hub - Hero & Bento */}
                    <div className="grid lg:grid-cols-12 gap-10 items-start">
                      <div className="lg:col-span-12 space-y-8">
                        {/* Sequence Identifier Header */}
                        <div className="flex flex-col gap-6 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between sm:pb-10">
                          <div className="space-y-3 sm:space-y-5">
                            <div className="inline-flex px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                              <span className="text-[9px] sm:text-[11px] font-black text-indigo-400 uppercase tracking-widest sm:tracking-[0.3em]">CORTEX_UPLINK_LIVE</span>
                            </div>
                            <div className="space-y-1 sm:space-y-2">
                              <h3 className="text-[10px] sm:text-xs font-mono font-black text-zinc-600 uppercase tracking-widest sm:tracking-[0.4em]">Target_Sequence</h3>
                              <div className="text-4xl sm:text-7xl font-display font-black text-white tracking-widest italic leading-none flex items-baseline gap-2 sm:gap-4">
                                <span className="opacity-20 text-xl sm:text-3xl font-normal tracking-tight">∑</span>
                                <span className={prediction ? 'text-glow-indigo' : ''}>
                                  {history.length > 0 ? getNextPeriod(history[0].issueNumber).slice(-4) : '####'}
                                </span>
                                <span className="text-[8px] sm:text-xs font-mono font-black tracking-widest text-indigo-500/40 ml-2 font-normal not-italic px-3 py-1.5 border border-indigo-500/10 rounded-xl bg-indigo-500/5 sm:ml-4 sm:px-4 sm:py-2">
                                  ID: {history.length > 0 ? getNextPeriod(history[0].issueNumber).slice(-6) : '---'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-row sm:flex-col sm:items-end gap-3 items-center justify-between sm:justify-start">
                             <div className="flex items-center gap-3 bg-white/5 px-4 py-2 sm:px-6 sm:py-3 rounded-2xl border border-white/10 shadow-inner">
                               <RefreshCcw className={`w-3 h-3 sm:w-4 sm:h-4 text-indigo-500 ${loading ? 'animate-spin' : ''}`} />
                               <span className="text-[8px] sm:text-xs font-mono font-black text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                                 {getMyanmarTime(lastUpdated).split(' ')[0]}
                               </span>
                             </div>
                             <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                               <span className="text-[8px] sm:text-[10px] font-black text-indigo-500/60 uppercase tracking-widest whitespace-nowrap">STABLE_LINK</span>
                             </div>
                          </div>
                        </div>

                        {/* High-Performance Bento Architecture */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                          {/* Probability Size */}
                          <motion.div whileHover={{ scale: 1.02 }} className="glass-card-premium p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] space-y-4 sm:space-y-8 relative overflow-hidden group border-white/20">
                            <div className="space-y-1 sm:space-y-2 relative z-10">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-indigo-500" />
                                <span className="text-[9px] sm:text-xs font-mono font-black text-zinc-500 uppercase tracking-widest sm:tracking-[0.3em]">Neural Size</span>
                              </div>
                              <div className={`text-4xl sm:text-7xl font-display font-black italic tracking-tighter ${prediction?.size === 'BIG' ? 'text-indigo-400 text-glow-indigo' : 'text-indigo-500 text-glow-indigo'}`}>
                                {loading && predictionLogs.length === 0 ? '--' : (prediction ? prediction.size : '--')}
                              </div>
                            </div>
                            <div className="pt-4 border-t border-white/10 flex items-center justify-between sm:pt-6">
                               <span className="text-[7px] sm:text-[10px] font-black text-zinc-500 uppercase tracking-widest">BIAS</span>
                               <span className="text-[8px] sm:text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">LOCKED</span>
                            </div>
                          </motion.div>

                          {/* Neural Prediction Index */}
                          <motion.div whileHover={{ scale: 1.02 }} className="glass-card-premium p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] space-y-4 sm:space-y-8 relative overflow-hidden group border-white/20">
                            <div className="space-y-1 sm:space-y-2 relative z-10">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-indigo-500" />
                                <span className="text-[9px] sm:text-xs font-mono font-black text-zinc-500 uppercase tracking-widest sm:tracking-[0.3em]">Neural Value</span>
                              </div>
                              <div className="text-4xl sm:text-7xl font-display font-black text-white italic tracking-tighter text-glow-indigo">
                                {loading && predictionLogs.length === 0 ? '?' : (prediction ? prediction.number : '--')}
                              </div>
                            </div>
                            <div className="pt-4 border-t border-white/10 flex items-center justify-between sm:pt-6">
                               <span className="text-[7px] sm:text-[10px] font-black text-zinc-500 uppercase tracking-widest">IDX</span>
                               <div className="flex gap-1">
                                  {[1,2,3].map(i => <div key={i} className={`w-1 h-3 rounded-full ${i <= 2 ? 'bg-indigo-500' : 'bg-white/10'}`} />)}
                               </div>
                            </div>
                          </motion.div>

                          {/* Chromatic Projection */}
                          <motion.div whileHover={{ scale: 1.02 }} className="glass-card-premium p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] space-y-4 sm:space-y-8 relative overflow-hidden border-white/20">
                            <div className="space-y-1 sm:space-y-2 relative z-10">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-indigo-500" />
                                <span className="text-[9px] sm:text-xs font-mono font-black text-zinc-500 uppercase tracking-widest sm:tracking-[0.3em]">Chroma</span>
                              </div>
                              <div className={`text-xl sm:text-4xl font-display font-black flex items-center gap-3 sm:gap-5 italic uppercase tracking-tight ${prediction ? getColorClass(prediction.color).split(' ')[0] : 'text-zinc-600'}`}>
                                <div className={`w-8 h-8 sm:w-14 sm:h-14 rounded-xl sm:rounded-[1.5rem] animate-pulse ring-4 sm:ring-8 ring-black/50 border border-white/20 shadow-2xl ${prediction?.color?.includes('red') ? 'bg-gradient-to-br from-rose-500 to-rose-700 shadow-rose-500/40' : ''} ${prediction?.color?.includes('green') ? 'bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-indigo-500/40' : ''} ${prediction?.color?.includes('violet') ? 'bg-gradient-to-br from-purple-500 to-purple-700 shadow-purple-500/40' : ''}`} />
                                <span className="hidden sm:inline">{prediction ? prediction.color.split('-')[0] : 'N/A'}</span>
                              </div>
                            </div>
                            <div className="pt-4 border-t border-white/10 sm:pt-6">
                               <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden p-[1px] border border-white/5">
                                 <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} className="h-full bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                               </div>
                            </div>
                          </motion.div>

                          {/* Confidence Core */}
                          <motion.div whileHover={{ scale: 1.02 }} className="glass-card-premium p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] space-y-4 sm:space-y-8 flex flex-col justify-between border-white/20">
                             <div className="space-y-1 sm:space-y-2 relative z-10">
                               <div className="flex items-center gap-1.5 sm:gap-2">
                                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-indigo-500" />
                                <span className="text-[9px] sm:text-xs font-mono font-black text-zinc-500 uppercase tracking-widest sm:tracking-[0.3em]">Uplink</span>
                               </div>
                               <div className="text-4xl sm:text-7xl font-display font-black text-white italic tracking-tighter text-glow-indigo">
                                 {prediction?.confidence ?? 0}<span className="text-xl sm:text-3xl font-normal opacity-20 ml-1">%</span>
                               </div>
                             </div>
                             <div className="relative pt-4 sm:pt-6">
                                <div className="w-full h-4 sm:h-6 bg-black/40 rounded-full overflow-hidden p-1 border border-white/10">
                                   <motion.div 
                                     className="h-full bg-gradient-to-r from-indigo-800 to-indigo-300 rounded-full glow-indigo shadow-lg"
                                     initial={{ width: 0 }}
                                     animate={{ width: `${prediction?.confidence ?? 0}%` }}
                                   />
                                </div>
                             </div>
                          </motion.div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Controls & Stats */}
                    <div className="flex flex-col lg:flex-row gap-8 items-stretch pt-6">
                      
                      {/* Registry Archives */}
                      <div className="flex-1 space-y-10">
                        <div className="flex flex-col gap-6 border-b border-indigo-500/10 pb-6 sm:flex-row sm:items-center sm:justify-between sm:pb-8">
                          <div className="flex items-center gap-4 sm:gap-5">
                            <div className="p-3 sm:p-4 bg-indigo-500/10 rounded-xl sm:rounded-2xl border border-indigo-500/20 shadow-xl glow-indigo">
                              <History className="text-indigo-400 w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-display font-black text-white uppercase tracking-widest sm:tracking-[0.3em] bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">Neural_Archives</h3>
                          </div>
                          
                          <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8">
                             <div className="flex items-center gap-3 bg-indigo-500/10 px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl sm:rounded-2xl border border-indigo-500/20 shadow-lg group">
                                <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
                                <span className="text-sm sm:text-base font-mono font-black text-indigo-400 tabular-nums">
                                  {predictionLogs.filter(l => l.status === 'WIN').length}
                                </span>
                                <span className="text-[8px] sm:text-[10px] font-black text-zinc-500 uppercase tracking-widest">WIN</span>
                             </div>
                             <div className="flex items-center gap-3 bg-rose-500/10 px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl sm:rounded-2xl border border-rose-500/20 shadow-lg group">
                                <Skull className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
                                <span className="text-sm sm:text-base font-mono font-black text-rose-400 tabular-nums">
                                  {predictionLogs.filter(l => l.status === 'LOSE').length}
                                </span>
                                <span className="text-[8px] sm:text-[10px] font-black text-zinc-500 uppercase tracking-widest">LOSS</span>
                             </div>
                          </div>
                        </div>

                        {/* Premium Registry Interface */}
                        <div className="glass-card-premium rounded-[2.5rem] sm:rounded-[4rem] overflow-hidden border-white/10 shadow-2xl">
                          <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[500px] sm:min-w-0">
                              <thead>
                                <tr className="border-b border-indigo-500/10 bg-indigo-500/[0.03]">
                                  <th className="py-6 px-8 sm:py-8 sm:px-12 text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest sm:tracking-[0.5em] border-r border-white/5">Event_ID</th>
                                  <th className="py-6 px-8 sm:py-8 sm:px-12 text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest sm:tracking-[0.5em] text-center border-r border-white/5">Bias</th>
                                  <th className="py-6 px-8 sm:py-8 sm:px-12 text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest sm:tracking-[0.5em] text-center border-r border-white/5">Actual</th>
                                  <th className="py-6 px-8 sm:py-8 sm:px-12 text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest sm:tracking-[0.5em] text-right">Result</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 font-mono text-[12px] sm:text-[14px]">
                                {loading && predictionLogs.length === 0 ? (
                                  <tr><td colSpan={4} className="py-32 text-center"><Loader2 className="w-12 h-12 animate-spin text-indigo-500/20 mx-auto" /></td></tr>
                                ) : predictionLogs.length === 0 ? (
                                  <tr><td colSpan={4} className="py-32 text-center text-zinc-800 text-[10px] uppercase font-black tracking-widest">Null_Archives</td></tr>
                                ) : [...predictionLogs].reverse().map((log) => (
                                    <tr key={log.issueNumber} className="hover:bg-indigo-500/[0.04] transition-all group">
                                      <td className="py-6 px-8 sm:py-10 sm:px-12 border-r border-white/5">
                                        <div className="flex flex-col gap-1">
                                          <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">#{log.timestamp.toLocaleTimeString().split(' ')[0]}</span>
                                          <span className="text-sm sm:text-lg font-black text-white italic tracking-widest group-hover:text-indigo-400 transition-colors">{log.issueNumber.slice(-6)}</span>
                                        </div>
                                      </td>
                                      <td className="py-6 px-8 sm:py-10 sm:px-12 text-center border-r border-white/5">
                                        <div className={`px-4 py-1.5 rounded-xl text-[11px] sm:text-[13px] font-black italic border ${log.predictedSize === 'BIG' ? 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5' : 'text-indigo-500 border-indigo-400/20 bg-indigo-400/5'}`}>
                                          {log.predictedSize}
                                        </div>
                                      </td>
                                      <td className="py-6 px-8 sm:py-10 sm:px-12 text-center border-r border-white/5">
                                        {log.actualSize ? (
                                          <div className="flex flex-col items-center gap-1">
                                            <span className={`text-sm sm:text-base font-black italic ${log.actualSize === 'BIG' ? 'text-indigo-400' : 'text-indigo-500'}`}>
                                              {log.actualSize}
                                            </span>
                                            <span className="text-[9px] text-zinc-700 font-black">NUM_{log.actualNumber}</span>
                                          </div>
                                        ) : (
                                          <div className="text-[9px] text-zinc-800 font-black tracking-widest animate-pulse">SYNCING</div>
                                        )}
                                      </td>
                                      <td className="py-6 px-8 sm:py-10 sm:px-12 text-right">
                                        <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl border font-black uppercase tracking-widest text-[10px] sm:text-xs ${log.status === 'WIN' ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400 shadow-indigo-500/10 shadow-lg' : log.status === 'LOSE' ? 'border-rose-500/20 bg-rose-500/10 text-rose-400' : 'border-white/5 bg-white/5 text-zinc-800'}`}>
                                          {log.status === 'WIN' ? <Trophy className="w-4 h-4" /> : log.status === 'LOSE' ? <Skull className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin text-zinc-800" />}
                                          <span className="hidden sm:inline">{log.status}</span>
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
                      <div className="lg:w-[28rem] space-y-8 sm:space-y-12">
                         {/* Neural Controller Node */}
                         <div className="glass-card-premium p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[4rem] border-white/20 shadow-indigo-500/5 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                               <Brain className="w-24 h-24 sm:w-32 sm:h-32" />
                            </div>
                            <h4 className="text-[10px] sm:text-xs font-black text-white uppercase tracking-[0.4em] flex items-center gap-4 mb-8 sm:mb-10">
                               <Cpu className="w-4 h-4 text-indigo-500" /> Control_Module
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 sm:gap-6 relative z-10">
                               <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={fetchPrediction} disabled={loading}
                                 className="w-full h-16 sm:h-20 flex items-center justify-between px-6 sm:px-8 bg-white/[0.03] rounded-2xl sm:rounded-[2rem] border border-white/10 hover:border-indigo-500/30 transition-all group disabled:opacity-30">
                                 <span className="text-[10px] sm:text-xs font-black uppercase text-zinc-500 group-hover:text-white transition-colors tracking-widest sm:tracking-[0.2em]">Manual_Sync</span>
                                 <RefreshCcw className={`w-5 h-5 text-indigo-500 ${loading ? 'animate-spin' : ''}`} />
                               </motion.button>
                               <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setAutoRefresh(!autoRefresh)}
                                 className={`w-full h-16 sm:h-20 flex items-center justify-between px-6 sm:px-8 rounded-2xl sm:rounded-[2rem] border transition-all ${autoRefresh ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-rose-500/5 border-rose-500/10'}`}>
                                 <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest sm:tracking-[0.2em] ${autoRefresh ? 'text-indigo-400' : 'text-rose-500'}`}>{autoRefresh ? 'STREAM_LINK' : 'STREAM_OFF'}</span>
                                 <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${autoRefresh ? 'bg-indigo-500 animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.8)]' : 'bg-zinc-900 border border-white/10'}`} />
                               </motion.button>
                            </div>

                            <div className="pt-8 mt-8 border-t border-white/5 space-y-6 sm:pt-10 sm:mt-10 sm:space-y-8">
                               <div className="space-y-3 sm:space-y-4">
                                  <div className="flex justify-between items-center text-[9px] sm:text-[11px] font-black text-zinc-600 uppercase tracking-widest sm:tracking-[0.3em]">
                                     <span>Core CPU Load</span>
                                     <span className="text-indigo-400 text-glow-indigo">12.08%</span>
                                  </div>
                                  <div className="flex gap-1.5 sm:gap-2">
                                     {[1,2,3,4,5,6,7,8].map(i => <div key={i} className={`h-2 sm:h-2.5 flex-1 rounded-full ${i <= 1 ? 'bg-indigo-500 shadow-lg glow-indigo' : 'bg-white/5'}`} />)}
                                  </div>
                               </div>
                               <div className="flex items-center justify-between bg-black/20 px-5 py-4 sm:px-5 sm:py-5 rounded-2xl sm:rounded-3xl border border-white/5">
                                  <div className="flex items-center gap-3 sm:gap-4">
                                     <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400 glow-indigo" />
                                     <span className="text-[9px] sm:text-xs font-black text-zinc-400 uppercase tracking-widest sm:tracking-[0.3em]">LATENCY</span>
                                  </div>
                                  <span className="text-xs sm:text-sm font-mono font-black text-indigo-400 text-glow-indigo tabular-nums">0.82ms</span>
                                </div>
                            </div>
                         </div>

                         {/* AI Logic Log */}
                         <div className="p-12 space-y-8 bg-indigo-500/[0.02] rounded-[3rem] border border-white/5">
                            <h5 className="text-xs font-black text-indigo-500/80 uppercase tracking-[0.5em] flex items-center gap-4">
                               <Activity className="w-5 h-5" /> Terminal_Output
                            </h5>
                            <div className="space-y-8 border-l-2 border-indigo-500/20 pl-8 font-mono italic">
                               <div className="space-y-4">
                                 <p className="text-[11px] leading-relaxed text-zinc-500 uppercase font-black tracking-widest">
                                   [INFO] Analysing BigWin packet protocol...
                                 </p>
                                 <p className="text-[11px] leading-relaxed text-zinc-400 uppercase font-black tracking-widest shadow-white/5">
                                   [OK] Pattern detected: Recursive sequence identified.
                                 </p>
                                 <p className="text-[11px] leading-relaxed text-indigo-500 uppercase font-black tracking-widest">
                                   [WARN] Neural engine recalibrating for next period...
                                 </p>
                               </div>
                            </div>
                         </div>

                         {/* Corporate Data */}
                         <div className="px-12 flex flex-col gap-6 text-[10px] font-black text-zinc-800 uppercase tracking-[0.5em] pb-12 italic opacity-40 hover:opacity-100 transition-opacity">
                            <div className="flex justify-between items-center px-2"><span>Architecture_Core</span><span className="text-indigo-900">Quantum_X86</span></div>
                            <div className="flex justify-between items-center px-2"><span>Neural_Author</span><span className="text-indigo-900">MGTHANT_AI_CORP</span></div>
                         </div>
                      </div>
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
