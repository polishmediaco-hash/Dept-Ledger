import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { collection, query, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { DebtItem } from '../types';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  debts: DebtItem[];
  currencyPreference: string;
  setCurrencyPreference: (currency: string) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [currencyPreference, setCurrencyPreferenceState] = useState('DZD');

  useEffect(() => {
    let unsubscribeDebts: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('FirebaseContext: Auth state changed:', firebaseUser ? `Logged in as ${firebaseUser.email}` : 'Not logged in');
      
      // Clean up previous debt listener if it exists
      if (unsubscribeDebts) {
        unsubscribeDebts();
        unsubscribeDebts = null;
      }

      setUser(firebaseUser);
      // Resolve main loading state as soon as we know the auth state
      setLoading(false);

      if (firebaseUser) {
        // Load profile and debts in the background
        const initUser = async () => {
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              setCurrencyPreferenceState(userDoc.data().currencyPreference || 'DZD');
            } else {
              await setDoc(userDocRef, {
                email: firebaseUser.email,
                currencyPreference: 'DZD',
                updatedAt: new Date().toISOString()
              });
              setCurrencyPreferenceState('DZD');
            }

            // Subscribe to debts
            const debtsQuery = query(collection(db, 'users', firebaseUser.uid, 'debts'));
            unsubscribeDebts = onSnapshot(debtsQuery, (snapshot) => {
              const debtsData: DebtItem[] = [];
              snapshot.forEach((doc) => {
                debtsData.push({ id: doc.id, ...doc.data() } as DebtItem);
              });
              setDebts(debtsData);
            }, (error) => {
              console.error('Debts snapshot error:', error);
            });
          } catch (error) {
            console.error('Firebase background init error:', error);
          }
        };

        initUser();
      } else {
        setDebts([]);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDebts) unsubscribeDebts();
    };
  }, []);

  const setCurrencyPreference = async (currency: string) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userDocRef, { currencyPreference: currency, updatedAt: new Date().toISOString() }, { merge: true });
      setCurrencyPreferenceState(currency);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  return (
    <FirebaseContext.Provider value={{ user, loading, debts, currencyPreference, setCurrencyPreference }}>
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
