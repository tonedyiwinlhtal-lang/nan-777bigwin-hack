import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVerifying: boolean;
  sessionKey: string | null;
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
  const [sessionKey, setSessionKey] = useState<string | null>(localStorage.getItem('cortex_session_key'));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const isAuthorized = localStorage.getItem('cortex_authorized') === 'true';
        const isAdminSession = localStorage.getItem('cortex_admin_session') === 'true';
        const sKey = localStorage.getItem('cortex_session_key');
        
        setIsAuthenticated(isAuthorized);
        setIsAdmin(isAuthorized && isAdminSession);
        setSessionKey(sKey);
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setSessionKey(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Continuous Session Monitoring
  useEffect(() => {
    if (!isAuthenticated || isAdmin || !sessionKey) return;

    const monitorInterval = setInterval(async () => {
      try {
        const keyRef = doc(db, 'keys', sessionKey);
        const keySnap = await getDoc(keyRef);

        if (!keySnap.exists()) {
          console.warn('Session key revoked by admin. Terminating...');
          localStorage.setItem('cortex_logout_reason', 'Access key has been revoked by administration.');
          logout();
          return;
        }

        const data = keySnap.data();
        if (data.expiresAt) {
          const expirationDate = data.expiresAt.toDate();
          if (new Date() > expirationDate) {
            console.warn('Session expired. Terminating...');
            localStorage.setItem('cortex_logout_reason', 'Temporal session has reached expiration.');
            logout();
          }
        }
      } catch (err) {
        console.error('Session monitor error:', err);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(monitorInterval);
  }, [isAuthenticated, isAdmin, sessionKey]);

  const verifyKey = async (key: string) => {
    setIsVerifying(true);
    try {
      const normalizedKey = key.trim().toUpperCase();

      // Master Admin Bypass
      if (normalizedKey === 'MGTHANT') {
        try {
          if (!auth.currentUser) {
            await signInAnonymously(auth);
          }
        } catch (e: any) {
          console.error('Bypass auth attempt failed:', e);
          // If it's the restricted operation error, we proceed so the user can at least see the dashboard
          // but we'll still have issues with Firestore operations until they fix it in the console.
        }
        localStorage.setItem('cortex_authorized', 'true');
        localStorage.setItem('cortex_admin_session', 'true');
        localStorage.setItem('cortex_session_key', normalizedKey);
        setIsAuthenticated(true);
        setIsAdmin(true);
        setSessionKey(normalizedKey);
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
      localStorage.setItem('cortex_session_key', normalizedKey);
      setIsAuthenticated(true);
      setSessionKey(normalizedKey);

      return { success: true };
    } catch (err: any) {
      console.error('Key verification error:', err);
      
      let friendlyError = err.message;
      if (err.code === 'auth/admin-restricted-operation') {
        friendlyError = 'FIREBASE_ERROR: Please enable "Anonymous Sign-in" in your Firebase Console (Authentication > Sign-in method).';
      }
      
      return { success: false, error: friendlyError };
    } finally {
      setIsVerifying(false);
    }
  };

  const logout = async () => {
    await auth.signOut();
    localStorage.removeItem('cortex_authorized');
    localStorage.removeItem('cortex_admin_session');
    localStorage.removeItem('cortex_session_key');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setSessionKey(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, isVerifying, sessionKey, verifyKey, logout, loading }}>
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
