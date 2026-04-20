import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Users, 
  Key, 
  Activity, 
  Settings, 
  LogOut, 
  Database, 
  Terminal, 
  Cpu, 
  Zap, 
  ArrowLeft,
  Search,
  Filter,
  Trash2,
  Copy,
  Plus,
  RefreshCw,
  LayoutDashboard,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from './FirebaseProvider';
import { KeyManager } from './KeyManager';

export const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'keys' | 'logs'>('overview');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { label: 'NETWORK_INTEGRITY', value: '99.98%', icon: Shield, color: 'text-indigo-500', trend: 'STABLE' },
    { label: 'UPLINK_BANDWIDTH', value: '1.2 Gbps', icon: Zap, color: 'text-amber-500', trend: 'PEAK' },
    { label: 'NEURAL_LOAD', value: '2.4%', icon: Cpu, color: 'text-rose-500', trend: 'LOW' },
    { label: 'DATABASE_LOCKED', value: 'ENCRYPTED', icon: Database, color: 'text-emerald-500', trend: 'MAX' },
  ];

  return (
    <div className="fixed inset-0 z-[150] bg-[#020204] flex flex-col overflow-hidden font-sans">
      {/* High-Fidelity Background */}
      <div className="absolute inset-0 bg-neural-mesh opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-rose-500/5 pointer-events-none" />
      
      {/* Top Notification bar */}
      <div className="h-1.5 w-full flex">
         <div className="flex-1 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.6)]" />
         <div className="flex-1 bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.6)]" />
         <div className="flex-1 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]" />
      </div>

      <div className="flex h-full">
        {/* Futuristic Sidebar */}
        <div className="w-20 lg:w-72 bg-black/60 border-r border-white/5 flex flex-col relative z-20 backdrop-blur-2xl">
          <div className="p-8 pb-12">
            <motion.div 
               initial={{ x: -20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               className="flex items-center gap-3 mb-2"
            >
               <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.5)]">
                  <Shield className="w-6 h-6 text-white" />
               </div>
               <div className="hidden lg:block">
                  <h1 className="text-xl font-black text-white italic tracking-tighter leading-none">CORTEX<span className="text-indigo-500">.</span>HUB</h1>
                  <p className="text-[7px] font-mono font-bold text-zinc-600 uppercase tracking-[0.4em] mt-1">Global_Admin_Unit</p>
               </div>
            </motion.div>
          </div>

          <nav className="flex-1 px-4 space-y-3">
            {[
              { id: 'overview', label: 'Telemetry', icon: LayoutDashboard },
              { id: 'keys', label: 'Auth Vectors', icon: Key },
              { id: 'logs', label: 'Log Stream', icon: Terminal },
            ].map((item, idx) => (
              <motion.button
                key={item.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-4 p-5 rounded-[1.5rem] transition-all relative group ${
                  activeTab === item.id 
                    ? 'bg-indigo-600 text-white shadow-[0_15px_40px_rgba(79,70,229,0.4)]' 
                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
                <span className="font-black text-[10px] uppercase tracking-[0.2em] hidden lg:block">{item.label}</span>
                {activeTab === item.id && (
                    <motion.div layoutId="nav-glow" className="absolute left-0 w-1 h-6 bg-white rounded-full lg:hidden" />
                )}
              </motion.button>
            ))}
          </nav>

          <div className="p-6 space-y-3">
            <button 
              onClick={onClose}
              className="w-full flex items-center gap-4 p-5 text-zinc-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
            >
              <ArrowLeft className="w-5 h-5 shrink-0" />
              <span className="font-black text-[10px] uppercase tracking-[0.2em] hidden lg:block">Hub_Retreat</span>
            </button>
            <button 
              onClick={logout}
              className="w-full flex items-center gap-4 p-5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all shadow-[0_0_20px_rgba(244,63,94,0.1)] hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] group"
            >
              <LogOut className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
              <span className="font-black text-[10px] uppercase tracking-[0.2em] hidden lg:block">System_Exit</span>
            </button>
          </div>
        </div>

        {/* Global Operation Area */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-black/20">
          {/* Status Header */}
          <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 backdrop-blur-3xl z-10">
            <div className="flex flex-col">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <h2 className="text-sm font-black text-white italic tracking-widest uppercase">Administrative_Session::Active</h2>
               </div>
               <p className="text-[8px] font-mono font-bold text-zinc-600 uppercase tracking-[0.5em] mt-1">Last_Sync: {currentTime.toLocaleTimeString()}</p>
            </div>
            
            <div className="flex items-center gap-8">
               <div className="hidden xl:flex items-center gap-4 px-6 py-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <Search className="w-4 h-4 text-zinc-600" />
                  <input type="text" placeholder="QUERY_OPERATIONAL_DATA_FEED..." className="bg-transparent border-none focus:outline-none text-[9px] font-mono text-white placeholder:text-zinc-700 w-64 uppercase tracking-widest" />
               </div>
               <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                     <p className="text-[10px] font-black text-white uppercase tracking-widest">MGTHANT_ROOT</p>
                     <p className="text-[8px] font-mono text-indigo-500 font-bold uppercase tracking-widest">Master_Level_0</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/20">
                     <Shield className="w-6 h-6 text-white" />
                  </div>
               </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  className="space-y-10"
                >
                  {/* Grid Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                      <motion.div 
                         key={idx} 
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: idx * 0.1 }}
                         className="glass-card-premium p-8 rounded-[2.5rem] border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all relative overflow-hidden group"
                      >
                        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                           <stat.icon className="w-16 h-16" />
                        </div>
                        <div className="flex items-center justify-between mb-6">
                           <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                              <stat.icon className="w-5 h-5" />
                           </div>
                           <span className="text-[8px] font-black py-1 px-2 rounded-full bg-white/5 text-zinc-500 tracking-widest">{stat.trend}</span>
                        </div>
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                        <p className="text-3xl font-black text-white italic tracking-tighter">{stat.value}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Main Grid Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Performance Graph */}
                    <div className="lg:col-span-2 glass-card-premium p-10 rounded-[3.5rem] border-white/5 bg-white/[0.01]">
                       <div className="flex justify-between items-center mb-12">
                         <div>
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] italic flex items-center gap-3">
                               <Activity className="w-4 h-4 text-indigo-500" />
                               Neural_Synergy_Fluctuation
                            </h3>
                            <p className="text-[8px] font-mono text-zinc-600 uppercase mt-1 tracking-widest">Real-time_Pattern_Recognition_Metrics</p>
                         </div>
                         <div className="flex gap-3">
                           <button className="px-4 py-2 bg-indigo-500 text-white text-[8px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-indigo-500/20">Active</button>
                           <button className="px-4 py-2 bg-white/5 text-zinc-500 text-[8px] font-black rounded-lg uppercase tracking-widest">History</button>
                         </div>
                       </div>
                       
                       <div className="h-72 flex items-end gap-3 px-4 relative">
                         <div className="absolute inset-0 flex flex-col justify-between opacity-10 pointer-events-none pr-8">
                            {[0, 1, 2, 3, 4].map(i => <div key={i} className="border-b border-white/60 w-full" />)}
                         </div>
                         {[45, 80, 55, 95, 75, 85, 60, 40, 100, 70, 50, 85, 65, 45, 90, 70].map((h, i) => (
                           <motion.div 
                             key={i}
                             initial={{ height: 0 }}
                             animate={{ height: `${h}%` }}
                             transition={{ delay: i * 0.04, type: 'spring', stiffness: 100 }}
                             className="flex-1 bg-gradient-to-t from-indigo-600/10 via-indigo-500/40 to-indigo-400 rounded-full relative group cursor-pointer"
                           >
                              <motion.div 
                                 initial={{ opacity: 0 }}
                                 whileHover={{ opacity: 1 }}
                                 className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-white/10 text-white text-[9px] font-black font-mono px-3 py-1.5 rounded-xl shadow-2xl backdrop-blur-xl z-20 whitespace-nowrap"
                              >
                                LOAD: {h}.00%
                              </motion.div>
                           </motion.div>
                         ))}
                       </div>
                    </div>

                    {/* Threat Intel */}
                    <div className="glass-card-premium p-10 rounded-[3.5rem] border-white/5 bg-white/[0.01]">
                       <div className="mb-10">
                          <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] italic flex items-center gap-3">
                             <ShieldAlert className="w-4 h-4 text-rose-500" />
                             System_Threat_Map
                          </h3>
                       </div>
                       
                       <div className="space-y-8">
                         {[
                           { label: 'Brute_Force_Blocked', val: '2,481', status: 'PROTECTED', c: 'text-emerald-500' },
                           { label: 'Injection_Intercepts', val: '142', status: 'SECURED', c: 'text-indigo-400' },
                           { label: 'Unauthorized_Queries', val: '12', status: 'BLOCKED', c: 'text-rose-500' },
                           { label: 'Kernel_Integrity', val: '100%', status: 'NOMINAL', c: 'text-emerald-500' },
                         ].map((item, i) => (
                           <motion.div 
                              key={i}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="group"
                           >
                              <div className="flex justify-between items-center mb-3">
                                 <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{item.label}</p>
                                 <span className={`text-[7px] font-black ${item.c} border border-current px-2 py-0.5 rounded-full`}>{item.status}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                 <p className="text-xl font-black text-white italic tracking-tighter">{item.val}</p>
                                 <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                     <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 1.5, delay: i * 0.2 }}
                                        className={`h-full bg-current ${item.c}`} 
                                      />
                                 </div>
                              </div>
                           </motion.div>
                         ))}
                       </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'keys' && (
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="max-w-6xl mx-auto pb-20"
                >
                  <div className="mb-12 flex items-center justify-between">
                    <div>
                      <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Auth_Vector_Master</h2>
                      <p className="text-[10px] font-mono font-bold text-indigo-500/60 tracking-[0.4em] uppercase mt-2">Provisioning_Dynamic_Session_Tokens</p>
                    </div>
                  </div>
                  
                  <div className="glass-card-premium p-12 rounded-[4rem] bg-black/40 border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-3xl">
                     <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full -mr-48 -mt-48" />
                     <KeyManagerEmbed />
                  </div>
                </motion.div>
              )}

              {activeTab === 'logs' && (
                <motion.div 
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -100 }}
                  className="max-w-5xl mx-auto"
                >
                  <div className="glass-card-premium p-10 rounded-[3rem] bg-black/40 border-white/5 font-mono text-[11px] relative overflow-hidden">
                    <div className="absolute inset-x-0 h-24 bg-gradient-to-b from-black/80 to-transparent top-0 z-10 pointer-events-none" />
                    <div className="flex items-center gap-3 mb-8 text-indigo-500 relative z-20">
                      <Terminal className="w-6 h-6 animate-pulse" />
                      <span className="font-black text-xs uppercase tracking-[0.6em]">System_Log_Matrix::Live_Stream</span>
                    </div>
                    <div className="space-y-6 h-[600px] overflow-y-auto custom-scrollbar pr-6 text-zinc-500 relative z-20">
                      <p className="text-emerald-500/80 font-bold"><span className="text-zinc-700 mr-2">[{currentTime.toLocaleTimeString()}]</span> :: KERNEL_INIT_SUCCESS :: 0x7F4A2</p>
                      <p><span className="text-zinc-700 mr-2">[{currentTime.toLocaleTimeString()}]</span> :: NEURAL_LINK_ESTABLISHED :: NODE_SGP_1</p>
                      <p className="text-indigo-400 font-bold"><span className="text-zinc-700 mr-2">[{currentTime.toLocaleTimeString()}]</span> :: ADMIN_BYPASS_AUTHORIZED :: UID_MGTHANT</p>
                      <p><span className="text-zinc-700 mr-2">[{currentTime.toLocaleTimeString()}]</span> :: DATA_STREAM_SYNC :: STATUS_OK</p>
                      {[...Array(15)].map((_, i) => (
                        <p key={i}><span className="text-zinc-700 mr-2">[{currentTime.toLocaleTimeString()}]</span> :: PROCESS_DUMP_{i} :: 0x{Math.random().toString(16).slice(2, 6).toUpperCase()} :: {i % 3 === 0 ? <span className="text-rose-500/50">SEC_CHECK_PASS</span> : 'NOMINAL'}</p>
                      ))}
                      <p className="text-emerald-500/80 font-bold animate-pulse mt-8">_ AWAITING_ADMIN_COMMAND...</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

// Simplified version of KeyManager to embed directly
const KeyManagerEmbed: React.FC = () => {
    // In a real refactor, we'd move KeyManager's core logic to a hook or separate service
    // For now, I'll just render the full KeyManager but without the absolute positioning/backdrop
    // Actually, I'll just use the existing KeyManager component and adjust it.
    // For this prototype, I'll essentially re-implement simplified version
    return (
        <div className="space-y-6">
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[3rem]">
                <KeyManagerEmbedContent />
            </div>
        </div>
    );
}

import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AccessKey {
  id: string;
  status: 'active' | 'used';
  createdAt: any;
  expiresAt: any;
  usedBy?: string;
  keyLabel?: string;
  duration?: string;
}

const KeyManagerEmbedContent: React.FC = () => {
  const [keys, setKeys] = useState<AccessKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [duration, setDuration] = useState('1h');
  const [keyLabel, setKeyLabel] = useState('');

  const durationOptions = [
    { label: '5m', value: '5m' },
    { label: '1h', value: '1h' },
    { label: '1d', value: '1d' },
    { label: '1w', value: '1w' },
    { label: '1mo', value: '1mo' },
    { label: '1y', value: '1y' },
    { label: 'Lifetime', value: 'lifetime' },
  ];

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'keys'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedKeys: AccessKey[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedKeys.push({
          id: doc.id,
          status: data.status,
          createdAt: data.createdAt?.toDate(),
          expiresAt: data.expiresAt?.toDate(),
          usedBy: data.usedBy,
          keyLabel: data.keyLabel,
          duration: data.duration
        });
      });
      setKeys(fetchedKeys);
    } catch (err) {
      console.error('Error fetching keys:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const generateKey = async () => {
    setGenerating(true);
    try {
      const randomPart = () => Math.random().toString(36).substring(2, 6).toUpperCase();
      const newKeyValue = `CORTEX-${randomPart()}-${randomPart()}`;
      
      let expiresAt = null;
      if (duration !== 'lifetime') {
        const now = new Date();
        const value = parseInt(duration);
        const unit = duration.replace(value.toString(), '');
        
        switch(unit) {
          case 'm': now.setMinutes(now.getMinutes() + value); break;
          case 'h': now.setHours(now.getHours() + value); break;
          case 'd': now.setDate(now.getDate() + value); break;
          case 'w': now.setDate(now.getDate() + (value * 7)); break;
          case 'mo': now.setMonth(now.getMonth() + value); break;
          case 'y': now.setFullYear(now.getFullYear() + value); break;
        }
        expiresAt = now;
      }

      const keyRef = doc(db, 'keys', newKeyValue);
      await setDoc(keyRef, {
        status: 'active',
        createdAt: serverTimestamp(),
        expiresAt: expiresAt ? expiresAt : null,
        keyLabel: keyLabel || `GEN_${Date.now().toString().slice(-4)}`,
        duration: duration
      });
      setKeyLabel('');
      await fetchKeys();
    } catch (err) {
      console.error('Error generating key:', err);
    } finally {
      setGenerating(false);
    }
  };

  const deleteKey = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'keys', id));
      await fetchKeys();
    } catch (err) {
      console.error('Error deleting key:', err);
    }
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
       <div className="bg-white/[0.03] border border-white/10 p-6 rounded-[2rem] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">VECTOR_LABEL</label>
                    <input 
                        type="text" 
                        value={keyLabel} 
                        onChange={(e) => setKeyLabel(e.target.value)}
                        placeholder="e.g. VIP_USER_ALPHA"
                        className="w-full bg-black/40 border border-white/5 rounded-2xl h-14 px-6 text-xs font-mono text-white placeholder:text-zinc-700 focus:border-indigo-500/50 transition-all outline-none"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">TEMPORAL_DURATION</label>
                    <div className="flex flex-wrap gap-2">
                        {durationOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setDuration(opt.value)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    duration === opt.value 
                                        ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' 
                                        : 'bg-white/5 text-zinc-500 hover:bg-white/10'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <button 
                onClick={generateKey}
                disabled={generating}
                className="w-full h-16 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_10px_40px_rgba(79,70,229,0.2)] transition-all disabled:opacity-50 group"
            >
               {generating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />}
               INITIALIZE_NEW_AUTH_VECTOR
            </button>
       </div>

       <div className="flex items-center justify-between px-2">
            <h4 className="text-[10px] font-black text-indigo-500/60 uppercase tracking-[0.5em]">Active_Payloads</h4>
            <button onClick={fetchKeys} className="text-zinc-500 hover:text-white transition-colors">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
       </div>

       <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {keys.map((key) => (
                <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={key.id}
                    className="p-6 bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 rounded-[2rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group transition-all backdrop-blur-md"
                >
                    <div className="flex items-start gap-4">
                        <div className={`mt-1.5 w-2 h-2 rounded-full ${key.status === 'active' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 opacity-40'} ${key.status === 'active' ? 'animate-pulse' : ''}`} />
                        <div>
                           <div className="flex items-center gap-3 mb-1">
                              <p className="text-sm font-mono font-black text-white tracking-widest">{key.id}</p>
                              <span className="px-2 py-0.5 rounded-full bg-white/5 text-zinc-500 text-[8px] font-black uppercase tracking-tighter">{key.duration}</span>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[9px] font-mono font-bold text-zinc-500 uppercase flex items-center gap-2">
                                 <span className="w-1 h-1 bg-zinc-800 rounded-full" /> Label: <span className="text-zinc-300">{key.keyLabel}</span>
                              </p>
                              <p className="text-[9px] font-mono font-bold text-zinc-500 uppercase flex items-center gap-2">
                                 <span className="w-1 h-1 bg-zinc-800 rounded-full" /> Status: <span className={key.status === 'active' ? 'text-emerald-500' : 'text-rose-500'}>{key.status}</span>
                              </p>
                              {key.expiresAt && (
                                <p className="text-[9px] font-mono font-bold text-indigo-400/60 uppercase flex items-center gap-2">
                                   <span className="w-1 h-1 bg-indigo-500/20 rounded-full" /> Expires: <span className="text-indigo-400">{key.expiresAt.toLocaleString()}</span>
                                </p>
                              )}
                              {!key.expiresAt && (
                                <p className="text-[9px] font-mono font-bold text-amber-500/60 uppercase flex items-center gap-2">
                                   <span className="w-1 h-1 bg-amber-500/20 rounded-full" /> Permanent_Lifecycle
                                </p>
                              )}
                           </div>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={() => copyToClipboard(key.id)} className={`flex-1 sm:flex-none p-3 rounded-xl transition-all ${copiedKey === key.id ? 'bg-emerald-500 text-white' : 'bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-white'}`}>
                           <Copy className="w-4 h-4 mx-auto" />
                        </button>
                        <button onClick={() => deleteKey(key.id)} className="flex-1 sm:flex-none p-3 bg-rose-500/5 text-rose-500/60 rounded-xl hover:bg-rose-500 hover:text-white transition-all group/del">
                           <Trash2 className="w-4 h-4 mx-auto group-hover/del:scale-110 transition-transform" />
                        </button>
                    </div>
                </motion.div>
            ))}
          </AnimatePresence>
       </div>
    </div>
  );
}
