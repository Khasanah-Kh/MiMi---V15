/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, logEvent, isSupported as isAnalyticsSupported, Analytics } from 'firebase/analytics';
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
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { DuelRoom } from './types/mimi';
import rawConfig from '../firebase-applet-config.json';
import { kirimEmailLaporan } from './services/emailService';

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

// 2. Initialize Firebase Analytics safely (browser only)
let analyticsInstance: Analytics | null = null;
if (typeof window !== 'undefined') {
  isAnalyticsSupported()
    .then((supported) => {
      if (supported) {
        analyticsInstance = getAnalytics(app);
      }
    })
    .catch(() => {});
}

// 3. Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// 4. Initialize Cloud Firestore with specified Database ID
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

// ─────────────────────────────────────────────────────────────────────────────
// 6. ACTIVITY LOGGING, USER TRACKING & ERROR REPORTING SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
let cachedClientIp: string | null = null;

export async function getVisitorIp(): Promise<string> {
  if (cachedClientIp) return cachedClientIp;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch('https://api.ipify.org?format=json', {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const json = await res.json();
      if (json?.ip) {
        cachedClientIp = String(json.ip);
        return cachedClientIp;
      }
    }
  } catch {
    // Ignore IP fetch failure
  }
  return 'tidak_diketahui';
}

export function detectDeviceLabel(): 'Mobile' | 'Desktop' {
  if (typeof navigator === 'undefined') return 'Desktop';
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
    ? 'Mobile'
    : 'Desktop';
}

/**
 * Fungsi log setiap aktivitas ke Firestore `activity_logs` & Firebase Analytics
 * type: 'login' | 'register' | 'guest_visit' | 'duel_start' | 'kuis_finish' | 'page_view' | 'warm_safe_toggle' | 'js_error' | 'promise_error'
 */
export async function logActivity(
  type: string,
  data: Record<string, any> = {}
): Promise<void> {
  try {
    const nowIso = new Date().toISOString();
    await addDoc(collection(db, 'activity_logs'), {
      type: String(type).slice(0, 64),
      data: {
        ...data,
        waktu: data.waktu || new Date().toLocaleString('id-ID'),
      },
      timestamp: serverTimestamp(),
      createdAtIso: nowIso,
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 480) : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href.slice(0, 480) : '',
    });

    if (analyticsInstance) {
      logEvent(analyticsInstance, type.slice(0, 38), data);
    }
  } catch (e) {
    console.warn('Log activity warning:', e);
  }
}

/**
 * Mencatat siapa yang masuk (Login, Register, maupun Tamu/Anonim)
 * ke `activity_logs` dan meng-update statistik di `users_log`
 */
export async function logUserAccess(params: {
  email?: string;
  nama?: string;
  kelas?: string;
  isGuest?: boolean;
  actionType?: 'login' | 'register' | 'guest_visit';
}): Promise<void> {
  try {
    const ip = await getVisitorIp();
    const device = detectDeviceLabel();
    const waktu = new Date().toLocaleString('id-ID');
    const isGuest = Boolean(params.isGuest);
    const email =
      params.email && params.email.trim()
        ? params.email.trim()
        : isGuest
        ? 'tamu_anonim@mimi15.id'
        : 'anonim@mimi15.id';
    const nama = params.nama?.trim() || (isGuest ? 'Tamu (Anonim)' : 'Anonim');
    const kelas =
      params.kelas ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('kelas') : null) ||
      'Kelas 8';
    const type = params.actionType || (isGuest ? 'guest_visit' : 'login');

    // 1. Catat ke activity_logs
    await logActivity(type, {
      email,
      nama,
      kelas,
      isGuest,
      device,
      ip,
      waktu,
    });

    // 2. Simpan/Update ke collection `users_log`
    const rawDocId = isGuest
      ? `guest_${ip.replace(/[^a-zA-Z0-9_-]/g, '_')}`
      : email.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeDocId = rawDocId.slice(0, 100) || 'user_anon';

    await setDoc(
      doc(db, 'users_log', safeDocId),
      {
        email: email.slice(0, 140),
        nama: nama.slice(0, 110),
        kelas: String(kelas).slice(0, 50),
        isGuest,
        lastLogin: serverTimestamp(),
        lastLoginFormatted: waktu,
        totalLogin: increment(1),
        device,
        ip: ip.slice(0, 60),
      },
      { merge: true }
    );

    // 3. Jika login/register akun baru (bukan sekadar refresh tamu), kirim notifikasi email
    if (!isGuest) {
      kirimEmailLaporan({
        emailPelapor: email,
        namaPelapor: nama,
        pesan: `User ${nama} (${email}) baru saja ${
          type === 'register' ? 'mendaftar akun baru' : 'login'
        } di kelas ${kelas} menggunakan perangkat ${device} (IP: ${ip}).`,
        type,
        kelas,
        deviceInfo: device,
        ip,
      }).catch(() => {});
    }
  } catch (e) {
    console.warn('logUserAccess warning:', e);
  }
}

/**
 * Menyimpan laporan error (manual dari form maupun auto-catch) ke `error_reports`
 * dan otomatis memicu email ke anna.adriiann@gmail.com
 */
export async function submitErrorReport(params: {
  emailPelapor?: string;
  namaPelapor?: string;
  pesan: string;
  screenshot?: string;
  errorStack?: string;
  type?: 'manual_report' | 'auto_catch' | 'promise_error';
}): Promise<void> {
  const emailPelapor = (
    params.emailPelapor ||
    auth.currentUser?.email ||
    'tamu_anonim@mimi15.id'
  ).slice(0, 140);
  const namaPelapor = (
    params.namaPelapor ||
    auth.currentUser?.displayName ||
    'Pelajar / Tamu'
  ).slice(0, 110);
  const url = typeof window !== 'undefined' ? window.location.href.slice(0, 480) : '';
  const deviceInfo =
    typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 480) : 'unknown';
  const nowIso = new Date().toISOString();
  const reportType = params.type || 'manual_report';

  await addDoc(collection(db, 'error_reports'), {
    type: reportType,
    emailPelapor,
    namaPelapor,
    pesan: String(params.pesan || '').slice(0, 3800),
    screenshot: params.screenshot || '',
    errorStack: String(params.errorStack || '').slice(0, 3800),
    url,
    timestamp: serverTimestamp(),
    createdAtIso: nowIso,
    waktuFormatted: new Date().toLocaleString('id-ID'),
    status: 'baru', // 'baru' | 'diproses' | 'selesai'
    deviceInfo,
  });

  // Trigger email otomatis ke anna.adriiann@gmail.com
  await kirimEmailLaporan({
    emailPelapor,
    namaPelapor,
    pesan: params.pesan,
    url,
    type: reportType,
    deviceInfo,
  });
}

/**
 * Mengambil seluruh data untuk halaman `/admin-laporan` (Owner: anna.adriiann@gmail.com)
 */
export async function fetchAdminDashboardData(): Promise<{
  activityLogs: any[];
  errorReports: any[];
  usersLogs: any[];
}> {
  const [actSnap, errSnap, usrSnap] = await Promise.all([
    getDocs(query(collection(db, 'activity_logs'), orderBy('createdAtIso', 'desc'), limit(250))).catch(
      () => getDocs(collection(db, 'activity_logs'))
    ),
    getDocs(query(collection(db, 'error_reports'), orderBy('createdAtIso', 'desc'), limit(150))).catch(
      () => getDocs(collection(db, 'error_reports'))
    ),
    getDocs(collection(db, 'users_log')),
  ]);

  const activityLogs = actSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const errorReports = errSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const usersLogs = usrSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return { activityLogs, errorReports, usersLogs };
}

export async function updateErrorReportStatus(
  reportId: string,
  status: 'baru' | 'diproses' | 'selesai'
): Promise<void> {
  await updateDoc(doc(db, 'error_reports', reportId), {
    status,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. FIREBASE AUTH HELPERS
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
