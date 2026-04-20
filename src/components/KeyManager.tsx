import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, Plus, Trash2, Copy, CheckCircle2, ShieldCheck, Database, RefreshCw, X } from 'lucide-react';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AccessKey {
  id: string;
  status: 'active' | 'used';
  createdAt: any;
  usedBy?: string;
  keyLabel?: string;
}

export const KeyManager: React.FC<{ onClose: () => void }> = ({ onClose }) => {
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
      // Generate a random high-entropy key: CORTEX-XXXX-XXXX
      const randomPart = () => Math.random().toString(36).substring(2, 6).toUpperCase();
      const newKeyValue = `CORTEX-${randomPart()}-${randomPart()}`;
      
      // We use the generated string as the Document ID for easy lookup
      const keyRef = doc(db, 'keys', newKeyValue);
      
      // Use setDoc instead of addDoc if we want custom ID
      // But for simplicity, I'll use the ID as the path
      const { setDoc } = await import('firebase/firestore');
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
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl glass-card-premium p-8 rounded-[3rem] border-white/10 shadow-3xl bg-[#09090b] relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                <Key className="w-6 h-6 text-indigo-500" />
             </div>
             <div>
               <h2 className="text-xl font-black text-white italic tracking-tight font-serif uppercase">Access_Key_Management</h2>
               <p className="text-[9px] font-mono font-bold text-zinc-500 tracking-[0.3em] uppercase">Security Control Vector</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-6 h-6 text-zinc-500" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="grid grid-cols-2 gap-4 mb-8">
           <button 
             onClick={generateKey}
             disabled={generating}
             className="h-16 flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all disabled:opacity-50"
           >
             {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
             Generate New Key
           </button>
           <button 
             onClick={fetchKeys}
             className="h-16 flex items-center justify-center gap-3 bg-white/[0.04] border border-white/10 hover:border-white/20 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all"
           >
             <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
             Sync Database
           </button>
        </div>

        {/* List */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
           <AnimatePresence mode="popLayout">
             {keys.length === 0 && !loading ? (
               <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                  <Database className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                  <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest font-black">Null_Records_Detected</p>
               </div>
             ) : (
               keys.map((key) => (
                 <motion.div 
                   layout
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   key={key.id}
                   className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-all group"
                 >
                   <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${key.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 opacity-30 shadow-none'}`} />
                      <div className="flex flex-col">
                        <span className="text-lg font-mono font-black text-white tracking-widest">{key.id}</span>
                        <div className="flex items-center gap-3 mt-1">
                           <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Status: {key.status}</span>
                           <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold">ID: {key.keyLabel}</span>
                        </div>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-2">
                      <button 
                        onClick={() => copyToClipboard(key.id)}
                        className={`p-3 rounded-xl transition-all ${copiedKey === key.id ? 'bg-emerald-500 text-white' : 'bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white'}`}
                      >
                         {copiedKey === key.id ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => deleteKey(key.id)}
                        className="p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                 </motion.div>
               ))
             )}
           </AnimatePresence>
        </div>

        {/* Status Bar */}
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-mono font-black text-emerald-500/60 uppercase tracking-widest">Database_Secure_Link_Active</span>
           </div>
           <span className="text-[9px] font-mono text-zinc-600 font-bold tracking-widest">Session_v2.1.0</span>
        </div>
      </div>
    </motion.div>
  );
};
