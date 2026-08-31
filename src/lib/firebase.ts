import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Ensure persistence is set to local
setPersistence(auth, browserLocalPersistence).catch(err => console.error('Persistence error:', err));

export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
}, firebaseConfig.firestoreDatabaseId || undefined);

export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

// Enhanced Firestore Error Handling
export function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  const isUnavailable = error?.code === 'unavailable';
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  if (isUnavailable) {
    console.warn('Firestore is currently operating in offline-cached mode or reconnecting...');
  } else {
    console.error('Firestore Error Detailed:', {
      code: error?.code,
      message: error?.message,
      operation: operationType,
      path
    });
  }

  return errInfo;
}

export const signInWithGoogle = async () => {
  try {
    console.log('Firebase Auth: Starting Google Sign-In via Popup...');
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Firebase Auth: Sign-In successful for:', result.user.email);
    return result.user;
  } catch (error) {
    console.error('Firebase Auth: Sign-In error:', error);
    throw error;
  }
};

export const logout = () => signOut(auth);
