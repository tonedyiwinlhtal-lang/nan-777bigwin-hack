import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVerifying: boolean;
  verifyKey: (key: string) => Promise<{ success: boolean; error?: string; isAdmin?: boolean }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const isAuthorized = localStorage.getItem('cortex_authorized') === 'true';
        const isAdminSession = localStorage.getItem('cortex_admin_session') === 'true';
        setIsAuthenticated(isAuthorized);
        setIsAdmin(isAuthorized && isAdminSession);
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const verifyKey = async (key: string) => {
    setIsVerifying(true);
    try {
      const normalizedKey = key.trim().toUpperCase();

      // Master Admin Bypass
      if (normalizedKey === 'MGTHANT') {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
        localStorage.setItem('cortex_authorized', 'true');
        localStorage.setItem('cortex_admin_session', 'true');
        setIsAuthenticated(true);
        setIsAdmin(true);
        return { success: true, isAdmin: true };
      }

      // 1. Sign in anonymously if not already
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      // 2. Check Key in Firestore
      const keyRef = doc(db, 'keys', normalizedKey);
      const keySnap = await getDoc(keyRef);

      if (!keySnap.exists()) {
        return { success: false, error: 'INVALID_ACCESS_KEY' };
      }

      const data = keySnap.data();
      if (data.status !== 'active') {
        return { success: false, error: 'KEY_ALREADY_IN_USE_OR_EXPIRED' };
      }

      // 3. Redeem Key
      await updateDoc(keyRef, {
        status: 'used',
        usedBy: auth.currentUser?.uid,
        usedAt: serverTimestamp()
      });

      // 4. Set local authorization
      localStorage.setItem('cortex_authorized', 'true');
      setIsAuthenticated(true);

      return { success: true };
    } catch (err: any) {
      console.error('Key verification error:', err);
      return { success: false, error: err.message };
    } finally {
      setIsVerifying(false);
    }
  };

  const logout = async () => {
    await auth.signOut();
    localStorage.removeItem('cortex_authorized');
    localStorage.removeItem('cortex_admin_session');
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, isVerifying, verifyKey, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context;
};
