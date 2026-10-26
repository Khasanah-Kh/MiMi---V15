/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
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

// Configuration provided by user and synced with firebase-applet-config.json
export const firebaseConfig = {
  apiKey: rawConfig.apiKey || 'AIzaSyAnSxWmYGm7y5wCZb0KVFiMNsjzsa0gSc0',
  authDomain: rawConfig.authDomain || 'gen-lang-client-0798249381.firebaseapp.com',
  projectId: rawConfig.projectId || 'gen-lang-client-0798249381',
  storageBucket: rawConfig.storageBucket || 'gen-lang-client-0798249381.firebasestorage.app',
  messagingSenderId: rawConfig.messagingSenderId || '482029330219',
  appId: rawConfig.appId || '1:482029330219:web:6780538aebaef1eab8ef6e',
  firestoreDatabaseId: rawConfig.firestoreDatabaseId || 'ai-studio-mimi15-fb0197b1-4c76-4f2f-8714-2b75a1bced3c',
};

// 1. Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 2. Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// 3. Initialize Cloud Firestore with specified Database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Validate connection to Firestore
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// 4. Firestore Error Handling Pattern as required by Firebase Integration Skill
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

// 5. Firebase Auth Helpers
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

// 6. Firestore User Sync Helpers
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

// 7. Real-Time Duel Arena Sync Helpers
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
