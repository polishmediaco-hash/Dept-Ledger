import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { collection, query, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { DebtItem } from '../types';

const CACHE_KEY_DEBTS = 'LEDGER_CACHED_DEBTS_v1';
const CACHE_KEY_USER = 'LEDGER_CACHED_USER_v1';
const CACHE_KEY_CURRENCY = 'LEDGER_CACHED_CURRENCY_v1';

export interface CachedUserInfo {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface FirebaseContextType {
  user: User | CachedUserInfo | null;
  loading: boolean;
  debts: DebtItem[];
  currencyPreference: string;
  setCurrencyPreference: (currency: string) => Promise<void>;
  isOnline: boolean;
  isSyncing: boolean;
  hasPendingWrites: boolean;
  setLocalDebtsOptimistic: React.Dispatch<React.SetStateAction<DebtItem[]>>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

// Helper to safely read from localStorage without blocking or crashing
function getInitialCachedDebts(): DebtItem[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY_DEBTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse cached debts:', e);
  }
  return [];
}

function getInitialCachedUser(): CachedUserInfo | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_USER);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse cached user:', e);
  }
  return null;
}

function getInitialCachedCurrency(): string {
  try {
    return localStorage.getItem(CACHE_KEY_CURRENCY) || 'DZD';
  } catch {
    return 'DZD';
  }
}

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronously initialize state from local cache for 0ms startup delay
  const [user, setUser] = useState<User | CachedUserInfo | null>(() => getInitialCachedUser());
  const [debts, setDebts] = useState<DebtItem[]>(() => getInitialCachedDebts());
  const [currencyPreference, setCurrencyPreferenceState] = useState<string>(() => getInitialCachedCurrency());
  
  // If we already have cached data/user, do not block the screen with a spinner
  const [loading, setLoading] = useState<boolean>(() => {
    const cachedUser = getInitialCachedUser();
    return !cachedUser;
  });

  const [isOnline, setIsOnline] = useState<boolean>(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [hasPendingWrites, setHasPendingWrites] = useState<boolean>(false);

  // Synchronize debts to localStorage whenever state changes
  const updateDebtsCache = useCallback((newDebts: DebtItem[]) => {
    try {
      localStorage.setItem(CACHE_KEY_DEBTS, JSON.stringify(newDebts));
    } catch (e) {
      console.warn('Failed to cache debts in storage:', e);
    }
  }, []);

  // Listen to browser online / offline network events
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network: Device is back online. Auto-resyncing with Firestore...');
      setIsOnline(true);
      setIsSyncing(true);
      // Give Firestore a brief moment to push queued writes
      setTimeout(() => setIsSyncing(false), 2000);
    };

    const handleOffline = () => {
      console.log('Network: Device is offline. Operating with local cache & offline queue...');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Firebase Auth and Firestore Snapshot Subscription
  useEffect(() => {
    let unsubscribeDebts: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('FirebaseContext: Auth state changed:', firebaseUser ? `Logged in as ${firebaseUser.email}` : 'Not logged in');

      if (unsubscribeDebts) {
        unsubscribeDebts();
        unsubscribeDebts = null;
      }

      if (firebaseUser) {
        const userInfo: CachedUserInfo = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };
        setUser(firebaseUser);
        try {
          localStorage.setItem(CACHE_KEY_USER, JSON.stringify(userInfo));
        } catch (e) {
          // ignore
        }
        setLoading(false);

        // Fetch / sync user profile & preferences in background
        const initUserProfile = async () => {
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              const pref = userDoc.data().currencyPreference || 'DZD';
              setCurrencyPreferenceState(pref);
              localStorage.setItem(CACHE_KEY_CURRENCY, pref);
            } else {
              const defaultPref = getInitialCachedCurrency();
              await setDoc(userDocRef, {
                email: firebaseUser.email,
                currencyPreference: defaultPref,
                updatedAt: new Date().toISOString()
              }, { merge: true });
            }
          } catch (error) {
            console.warn('Firebase user preference read note (cached/offline):', error);
          }
        };

        initUserProfile();

        // Subscribe to real-time debts with cache & pending write awareness
        try {
          setIsSyncing(true);
          const debtsQuery = query(collection(db, 'users', firebaseUser.uid, 'debts'));
          
          unsubscribeDebts = onSnapshot(
            debtsQuery,
            { includeMetadataChanges: true },
            (snapshot) => {
              const debtsData: DebtItem[] = [];
              snapshot.forEach((doc) => {
                debtsData.push({ id: doc.id, ...doc.data() } as DebtItem);
              });

              setDebts(debtsData);
              updateDebtsCache(debtsData);

              const pending = snapshot.metadata.hasPendingWrites;
              setHasPendingWrites(pending);
              setIsSyncing(pending);
            },
            (error) => {
              console.warn('Debts snapshot listener note (operating in offline/cached mode):', error);
              setIsSyncing(false);
            }
          );
        } catch (error) {
          console.error('Failed to attach debt snapshot:', error);
          setIsSyncing(false);
        }
      } else {
        // If not logged in and online, clear user state
        if (navigator.onLine) {
          setUser(null);
          localStorage.removeItem(CACHE_KEY_USER);
        }
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDebts) unsubscribeDebts();
    };
  }, [updateDebtsCache]);

  // Set currency preference with instant optimistic local cache update
  const setCurrencyPreference = async (currency: string) => {
    setCurrencyPreferenceState(currency);
    try {
      localStorage.setItem(CACHE_KEY_CURRENCY, currency);
    } catch (e) {
      // ignore
    }

    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userDocRef, { currencyPreference: currency, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        loading,
        debts,
        currencyPreference,
        setCurrencyPreference,
        isOnline,
        isSyncing,
        hasPendingWrites,
        setLocalDebtsOptimistic: setDebts,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
