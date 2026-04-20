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
  LayoutDashboard
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
    { label: 'SYSTEM_STATUS', value: 'OPERATIONAL', icon: Activity, color: 'text-emerald-500' },
    { label: 'UPLINK_LATENCY', value: '24ms', icon: Zap, color: 'text-indigo-500' },
    { label: 'KERNEL_LOAD', value: '1.2%', icon: Cpu, color: 'text-amber-500' },
    { label: 'DATABASE_LOCKED', value: 'TRUE', icon: Database, color: 'text-blue-500' },
  ];

  return (
    <div className="fixed inset-0 z-[150] bg-[#030303] flex flex-col overflow-hidden font-sans">
      {/* Neural Background */}
      <div className="absolute inset-0 bg-neural-mesh opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_20px_rgba(99,102,241,0.5)]" />

      {/* Sidebar / Navigation */}
      <div className="flex h-full">
        <div className="w-20 sm:w-64 bg-black/40 border-r border-white/5 flex flex-col relative z-10 backdrop-blur-3xl">
          <div className="p-6 mb-8">
            <h1 className="text-2xl font-black text-white italic tracking-tighter hidden sm:block">
              CORTEX<span className="text-indigo-500">.</span>ADMIN
            </h1>
            <Shield className="w-8 h-8 text-indigo-500 sm:hidden mx-auto" />
            <p className="text-[8px] font-mono font-bold text-zinc-600 tracking-[0.3em] uppercase mt-1 hidden sm:block">Privileged_Access_v6</p>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {[
              { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'keys', label: 'Access Keys', icon: Key },
              { id: 'logs', label: 'System Logs', icon: Terminal },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${
                  activeTab === item.id 
                    ? 'bg-indigo-600 text-white shadow-[0_10px_30px_rgba(79,70,229,0.3)]' 
                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="font-bold text-xs uppercase tracking-widest hidden sm:block">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 space-y-2 mt-auto">
            <button 
              onClick={onClose}
              className="w-full flex items-center gap-4 p-4 text-zinc-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
            >
              <ArrowLeft className="w-5 h-5 shrink-0" />
              <span className="font-bold text-xs uppercase tracking-widest hidden sm:block">Return_to_Hub</span>
            </button>
            <button 
              onClick={logout}
              className="w-full flex items-center gap-4 p-4 text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span className="font-bold text-xs uppercase tracking-widest hidden sm:block">Terminate</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* Top Bar */}
          <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 backdrop-blur-md">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-mono font-bold text-emerald-500/60 uppercase tracking-widest">Local_Session_Secure</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest hidden md:block">Time: {currentTime.toLocaleTimeString()}</span>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                  <Search className="w-4 h-4 text-zinc-600" />
                  <input type="text" placeholder="QUERY_DATA..." className="bg-transparent border-none focus:outline-none text-[10px] font-mono text-white placeholder:text-zinc-700 w-32" />
               </div>
               <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                  <Shield className="w-5 h-5 text-indigo-500" />
               </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                      <div key={idx} className="glass-card-premium p-6 rounded-3xl border-white/5 bg-white/[0.02]">
                        <div className="flex items-center justify-between mb-4">
                           <stat.icon className={`w-6 h-6 ${stat.color}`} />
                           <div className="w-1 h-1 rounded-full bg-zinc-800" />
                        </div>
                        <p className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-xl font-black text-white italic tracking-tight">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 glass-card-premium p-8 rounded-[2.5rem] border-white/5 bg-white/[0.02]">
                       <div className="flex justify-between items-center mb-8">
                         <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] font-mono italic">Neural_Performance_Grid</h3>
                         <div className="flex gap-2">
                           <div className="w-8 h-1 bg-indigo-500 rounded-full" />
                           <div className="w-4 h-1 bg-zinc-800 rounded-full" />
                         </div>
                       </div>
                       <div className="h-64 flex items-end gap-2 px-2">
                         {[40, 70, 45, 90, 65, 80, 50, 30, 95, 60, 40, 75].map((h, i) => (
                           <motion.div 
                             key={i}
                             initial={{ height: 0 }}
                             animate={{ height: `${h}%` }}
                             transition={{ delay: i * 0.05 }}
                             className="flex-1 bg-gradient-to-t from-indigo-500/20 to-indigo-500 rounded-t-lg relative group"
                           >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[8px] font-mono px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {h}%
                              </div>
                           </motion.div>
                         ))}
                       </div>
                    </div>

                    <div className="glass-card-premium p-8 rounded-[2.5rem] border-white/5 bg-white/[0.02]">
                       <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] font-mono italic mb-8">Security_Threat_Map</h3>
                       <div className="space-y-6">
                         {[
                           { label: 'Access_Attempts', val: 842, p: '↑ 12%' },
                           { label: 'Encryption_Sync', val: 'Active', p: 'OK' },
                           { label: 'Brute_Force_Blocked', val: 24, p: 'SECURE' },
                         ].map((item, i) => (
                           <div key={i} className="flex justify-between items-end border-b border-white/5 pb-4">
                             <div>
                               <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase mb-1">{item.label}</p>
                               <p className="text-lg font-black text-white italic">{item.val}</p>
                             </div>
                             <span className={`text-[10px] font-mono font-bold ${item.p.includes('↑') || item.p === 'OK' ? 'text-emerald-500' : 'text-indigo-400'}`}>{item.p}</span>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'keys' && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full"
                >
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Access_Control_Unit</h2>
                      <p className="text-[9px] font-mono font-bold text-zinc-600 tracking-[0.4em] uppercase mt-1">Manage_Dynamic_Injections</p>
                    </div>
                  </div>
                  {/* Reuse KeyManager Content but with full-page styling */}
                  <div className="max-w-4xl">
                     <KeyManagerEmbed />
                  </div>
                </motion.div>
              )}

              {activeTab === 'logs' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="glass-card-premium p-8 rounded-[2.5rem] bg-black/40 border-white/5 font-mono text-[11px]"
                >
                  <div className="flex items-center gap-2 mb-6 text-indigo-500">
                    <Terminal className="w-5 h-5" />
                    <span className="font-black uppercase tracking-widest">Primary_System_Feed</span>
                  </div>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-4 text-zinc-400">
                    <p className="text-emerald-500/80">[13:42:01] :: KERNEL_INIT_SUCCESS :: 0x7F4A2</p>
                    <p>[13:42:04] :: NEURAL_LINK_ESTABLISHED :: ASIA_SOUTHEAST_NODE_4</p>
                    <p className="text-indigo-400">[13:43:10] :: ADMIN_BYPASS_AUTHORIZED :: UID_MGTHANT</p>
                    <p>[13:43:12] :: FETCHING_NEURAL_RECORDS ... COMPLETE</p>
                    <p>[13:44:00] :: SYNC_STATE_SYNCED :: LATENCY_22MS</p>
                    <p className="text-rose-500/60">[13:44:05] :: SEC_ALERT_BLOCKED :: IP_REF_104.22.4</p>
                    <p>[13:44:10] :: LOG_STREAM_BUFFERED</p>
                    <p className="text-zinc-700 animate-pulse mt-4">_ AWAITING_NEXT_COMMAND...</p>
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
  usedBy?: string;
  keyLabel?: string;
}

const KeyManagerEmbedContent: React.FC = () => {
  const [keys, setKeys] = useState<AccessKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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
          usedBy: data.usedBy,
          keyLabel: data.keyLabel
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
      const keyRef = doc(db, 'keys', newKeyValue);
      await setDoc(keyRef, {
        status: 'active',
        createdAt: serverTimestamp(),
        keyLabel: `GEN_${Date.now().toString().slice(-4)}`
      });
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
       <div className="flex gap-4 mb-2">
            <button 
                onClick={generateKey}
                disabled={generating}
                className="px-8 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl flex items-center gap-3 font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50"
            >
               {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
               Create_Auth_Vector
            </button>
            <button 
                onClick={fetchKeys}
                className="px-6 h-14 bg-white/5 hover:bg-white/10 text-white rounded-2xl flex items-center gap-3 font-bold text-xs transition-all"
            >
               <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {keys.map((key) => (
                <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={key.id}
                    className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-indigo-500/30 transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-1.5 h-1.5 rounded-full ${key.status === 'active' ? 'bg-emerald-500 pulse' : 'bg-rose-500 opacity-40'}`} />
                        <div>
                           <p className="text-xs font-mono font-black text-white tracking-widest">{key.id}</p>
                           <p className="text-[8px] font-mono text-zinc-500 uppercase mt-0.5">{key.keyLabel} • {key.status}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => copyToClipboard(key.id)} className={`p-2 rounded-lg ${copiedKey === key.id ? 'bg-emerald-500' : 'bg-white/5 text-zinc-500'}`}>
                           <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteKey(key.id)} className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all">
                           <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </motion.div>
            ))}
          </AnimatePresence>
       </div>
    </div>
  );
}
