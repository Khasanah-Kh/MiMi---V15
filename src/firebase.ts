/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, logEvent, isSupported as isAnalyticsSupported, Analytics } from 'firebase/analytics';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { DuelRoom } from './types/mimi';
import rawConfig from '../firebase-applet-config.json';

// Helper to safely read environment variables in both Vite browser and Node/SSR contexts
function getEnvVar(key: string): string | undefined {
  try {
    const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> })?.env;
    if (metaEnv && typeof metaEnv[key] === 'string' && metaEnv[key]!.trim() !== '') {
      return metaEnv[key]!.trim();
    }
  } catch {
    // ignore import.meta access errors
  }
  try {
    if (typeof process !== 'undefined' && process.env && typeof process.env[key] === 'string' && process.env[key]!.trim() !== '') {
      return process.env[key]!.trim();
    }
  } catch {
    // ignore process.env access errors
  }
  return undefined;
}

// Resolve Firebase configuration from environment variables first, falling back to firebase-applet-config.json
export const firebaseConfig = {
  apiKey:
    getEnvVar('VITE_FIREBASE_API_KEY') ||
    getEnvVar('FIREBASE_API_KEY') ||
    rawConfig?.apiKey ||
    'AIzaSyAnSxWmYGm7y5wCZb0KVFiMNsjzsa0gSc0',
  authDomain:
    getEnvVar('VITE_FIREBASE_AUTH_DOMAIN') ||
    getEnvVar('FIREBASE_AUTH_DOMAIN') ||
    rawConfig?.authDomain ||
    'gen-lang-client-0798249381.firebaseapp.com',
  projectId:
    getEnvVar('VITE_FIREBASE_PROJECT_ID') ||
    getEnvVar('FIREBASE_PROJECT_ID') ||
    getEnvVar('GOOGLE_CLOUD_PROJECT') ||
    rawConfig?.projectId ||
    'gen-lang-client-0798249381',
  storageBucket:
    getEnvVar('VITE_FIREBASE_STORAGE_BUCKET') ||
    getEnvVar('FIREBASE_STORAGE_BUCKET') ||
    rawConfig?.storageBucket ||
    'gen-lang-client-0798249381.firebasestorage.app',
  messagingSenderId:
    getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID') ||
    getEnvVar('FIREBASE_MESSAGING_SENDER_ID') ||
    rawConfig?.messagingSenderId ||
    '482029330219',
  appId:
    getEnvVar('VITE_FIREBASE_APP_ID') ||
    getEnvVar('FIREBASE_APP_ID') ||
    rawConfig?.appId ||
    '1:482029330219:web:6780538aebaef1eab8ef6e',
  firestoreDatabaseId:
    getEnvVar('VITE_FIREBASE_FIRESTORE_DATABASE_ID') ||
    getEnvVar('FIREBASE_FIRESTORE_DATABASE_ID') ||
    rawConfig?.firestoreDatabaseId ||
    'ai-studio-mimi15-fb0197b1-4c76-4f2f-8714-2b75a1bced3c',
  oAuthClientId:
    getEnvVar('VITE_FIREBASE_OAUTH_CLIENT_ID') ||
    rawConfig?.oAuthClientId ||
    '482029330219-fs7jrboijghurprjp95geqe3sqplb7u8.apps.googleusercontent.com',
};

// 1. Initialize Firebase App robustly against duplicate or malformed initialization
function initFirebaseApp(): FirebaseApp {
  try {
    return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  } catch (err) {
    console.error('Firebase initializeApp error, retrying with fallback config:', err);
    return getApps().length > 0 ? getApp() : initializeApp(rawConfig);
  }
}

export const app: FirebaseApp = initFirebaseApp();

// 2. Initialize Firebase Analytics safely (browser only)
let analyticsInstance: Analytics | null = null;
if (typeof window !== 'undefined') {
  try {
    isAnalyticsSupported()
      .then((supported) => {
        if (supported) {
          try {
            analyticsInstance = getAnalytics(app);
          } catch {
            // Ignore analytics initialization errors in restricted environments
          }
        }
      })
      .catch(() => {});
  } catch {
    // Ignore synchronous errors if IndexedDB/cookies are blocked
  }
}

// 3. Initialize Firebase Auth safely
export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// 4. Initialize Cloud Firestore with specified Database ID and fallback guard
function initFirestoreInstance(firebaseApp: FirebaseApp): Firestore {
  try {
    if (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') {
      return getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    }
    return getFirestore(firebaseApp);
  } catch (err) {
    console.warn('Named Firestore initialization failed, falling back to default instance:', err);
    return getFirestore(firebaseApp);
  }
}

export const db: Firestore = initFirestoreInstance(app);

// Validate connection to Firestore on startup (browser only)
async function testConnection() {
  if (typeof window === 'undefined') return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// 5. Firestore Error Handling Pattern as required by Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
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
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const currentUser = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo:
        currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function logActivity(
  type: string,
  data: Record<string, any> = {}
): Promise<void> {
  try {
    if (analyticsInstance) {
      logEvent(analyticsInstance, type.slice(0, 38), data);
    }
  } catch {
    // ignore
  }
}

export async function logUserAccess(_params: Record<string, any> = {}): Promise<void> {
  // Email reporting & user access tracking disabled as requested
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. FIREBASE AUTH HELPERS
// ─────────────────────────────────────────────────────────────────────────────
export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return cred.user;
}

export async function registerWithEmail(
  name: string,
  email: string,
  pass: string
): Promise<FirebaseUser> {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (name.trim()) {
    await updateProfile(cred.user, { displayName: name.trim() });
  }
  return cred.user;
}

export async function loginWithGoogle(): Promise<FirebaseUser> {
  const cred = await signInWithPopup(auth, googleProvider);
  return cred.user;
}

export async function logoutFirebase(): Promise<void> {
  await signOut(auth);
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. FIRESTORE USER SYNC HELPERS
// ─────────────────────────────────────────────────────────────────────────────
export async function saveUserProgressToFirestore(
  userId: string,
  userData: Record<string, any>
): Promise<void> {
  const docPath = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(
      userDocRef,
      {
        uid: userId,
        ...userData,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

export async function getUserProgressFromFirestore(
  userId: string
): Promise<Record<string, any> | null> {
  const docPath = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, docPath);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. REAL-TIME DUEL ARENA SYNC HELPERS
// ─────────────────────────────────────────────────────────────────────────────
export async function createDuelRoom(roomData: DuelRoom): Promise<string> {
  const docPath = `duel_rooms/${roomData.roomId}`;
  try {
    const roomRef = doc(db, 'duel_rooms', roomData.roomId);
    await setDoc(roomRef, {
      ...roomData,
      updatedAt: serverTimestamp(),
    });
    return roomData.roomId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

export async function joinDuelRoom(
  roomId: string,
  guestPlayer: DuelRoom['host']
): Promise<boolean> {
  const docPath = `duel_rooms/${roomId}`;
  try {
    const roomRef = doc(db, 'duel_rooms', roomId);
    const snap = await getDoc(roomRef);
    if (!snap.exists()) {
      throw new Error(`Room duel ${roomId} tidak ditemukan.`);
    }
    const current = snap.data() as DuelRoom;
    if (current.status !== 'waiting') {
      throw new Error(`Room duel sudah dimulai atau selesai.`);
    }
    await setDoc(
      roomRef,
      {
        guest: guestPlayer,
        status: 'countdown',
        countdown: 3,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

export async function updateDuelRoomState(
  roomId: string,
  updates: Partial<DuelRoom>
): Promise<void> {
  const docPath = `duel_rooms/${roomId}`;
  try {
    const roomRef = doc(db, 'duel_rooms', roomId);
    await setDoc(
      roomRef,
      {
        ...updates,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, docPath);
  }
}

export function subscribeToDuelRoom(
  roomId: string,
  onUpdate: (room: DuelRoom | null) => void,
  onError?: (err: any) => void
): () => void {
  const roomRef = doc(db, 'duel_rooms', roomId);
  return onSnapshot(
    roomRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as DuelRoom);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      console.warn('Duel room snapshot listener error:', error);
      if (onError) onError(error);
    }
  );
}

export async function removeDuelRoom(roomId: string): Promise<void> {
  const docPath = `duel_rooms/${roomId}`;
  try {
    const roomRef = doc(db, 'duel_rooms', roomId);
    await deleteDoc(roomRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, docPath);
  }
}

export { onAuthStateChanged, updateProfile };
