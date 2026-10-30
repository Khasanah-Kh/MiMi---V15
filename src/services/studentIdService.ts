/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  query,
  limit,
  increment,
} from 'firebase/firestore';
import { updateProfile, User as FirebaseUser } from 'firebase/auth';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';

export interface StudentProfile {
  uid: string;
  studentId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: number;
  lastNameChange?: number | null;
  googleLinked: boolean;
  xp?: number;
  level?: number;
  streakDays?: number;
  cyberRank?: string;
  rivalWins?: number;
  rivalMatches?: number;
}

export interface StudentFriend {
  friendUid: string;
  friendStudentId: string;
  friendDisplayName: string;
  friendPhotoUrl?: string;
  status: 'accepted' | 'pending';
  addedAt: number;
}

export interface GameHistoryEntry {
  id: string;
  arenaTitle: string;
  category: string;
  level: string;
  score: number;
  totalQuestions: number;
  result: 'menang' | 'kalah' | 'imbang';
  opponentName: string;
  timestamp: number;
  xpEarned: number;
}

/**
 * Generate a unique, memorable 8-character uppercase alphanumeric ID
 * Format: MIMI-XXXX-XXXX (e.g. MIMI-A3F9-K2L1)
 */
export function generateStudentIdString(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excludes confusing 0, 1, I, O
  let part1 = '';
  let part2 = '';
  for (let i = 0; i < 4; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `MIMI-${part1}-${part2}`;
}

/**
 * Normalize Student ID: removes spaces, uppercase, ensures MIMI- format
 */
export function normalizeStudentId(input: string): string {
  const clean = input.trim().toUpperCase().replace(/\s+/g, '');
  if (!clean.startsWith('MIMI-')) {
    if (clean.length === 8) {
      return `MIMI-${clean.slice(0, 4)}-${clean.slice(4)}`;
    }
    if (clean.replace(/-/g, '').length === 8) {
      const raw = clean.replace(/-/g, '');
      return `MIMI-${raw.slice(0, 4)}-${raw.slice(4)}`;
    }
  }
  return clean;
}

/**
 * Get or create permanent Student ID profile linked to the user's Google account
 */
export async function getOrCreateStudentProfile(
  fbUser: FirebaseUser
): Promise<StudentProfile> {
  const userDocRef = doc(db, 'users', fbUser.uid);
  const userSnap = await getDoc(userDocRef);
  const isCreator =
    (fbUser.email || '').trim().toLowerCase() === 'anna.adriiann@gmail.com';

  if (userSnap.exists()) {
    const data = userSnap.data();
    if (data.studentId) {
      const resolvedName = isCreator
        ? 'Mimi15_Real'
        : data.displayName || fbUser.displayName || 'Bestie Pelajar';

      if (isCreator && data.displayName !== 'Mimi15_Real') {
        try {
          await setDoc(userDocRef, { displayName: 'Mimi15_Real' }, { merge: true });
        } catch {
          // ignore
        }
      }

      // Profile and Student ID already exist, return permanently
      const profile: StudentProfile = {
        uid: fbUser.uid,
        studentId: data.studentId,
        email: data.email || fbUser.email || '',
        displayName: resolvedName,
        photoURL: data.photoURL || fbUser.photoURL || '',
        createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
        lastNameChange:
          typeof data.lastNameChange === 'number'
            ? data.lastNameChange
            : data.lastNameChange?.toMillis?.() || null,
        googleLinked: true,
        xp: typeof data.xp === 'number' ? data.xp : 100,
        level: typeof data.level === 'number' ? data.level : 1,
        streakDays: typeof data.streakDays === 'number' ? data.streakDays : 1,
        cyberRank: data.cyberRank || 'Siswa Cyber',
        rivalWins: typeof data.rivalWins === 'number' ? data.rivalWins : 0,
        rivalMatches: typeof data.rivalMatches === 'number' ? data.rivalMatches : 0,
      };

      // Ensure index is active
      try {
        const indexRef = doc(db, 'studentIdIndex', data.studentId);
        await setDoc(
          indexRef,
          {
            uid: fbUser.uid,
            studentId: data.studentId,
            displayName: profile.displayName,
            email: profile.email,
            photoURL: profile.photoURL || '',
            updatedAt: Date.now(),
          },
          { merge: true }
        );
      } catch {
        // ignore index sync error
      }

      return profile;
    }
  }

  // Create new unique student ID
  let newStudentId = generateStudentIdString();
  // Guarantee uniqueness by checking index
  for (let attempt = 0; attempt < 3; attempt++) {
    const indexCheck = await getDoc(doc(db, 'studentIdIndex', newStudentId));
    if (!indexCheck.exists()) break;
    newStudentId = generateStudentIdString();
  }

  const now = Date.now();
  const newProfile: StudentProfile = {
    uid: fbUser.uid,
    studentId: newStudentId,
    email: fbUser.email || '',
    displayName: isCreator ? 'Mimi15_Real' : fbUser.displayName || 'Bestie Pelajar',
    photoURL: fbUser.photoURL || '',
    createdAt: now,
    lastNameChange: null,
    googleLinked: true,
    xp: 100,
    level: 1,
    streakDays: 1,
    cyberRank: 'Siswa Cyber',
    rivalWins: 0,
    rivalMatches: 0,
  };

  // 1. Save user document
  await setDoc(
    userDocRef,
    {
      ...newProfile,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // 2. Save fast index document
  try {
    await setDoc(doc(db, 'studentIdIndex', newStudentId), {
      uid: fbUser.uid,
      studentId: newStudentId,
      displayName: newProfile.displayName,
      email: newProfile.email,
      photoURL: newProfile.photoURL,
      createdAt: now,
    });
  } catch (err) {
    console.warn('Could not write studentIdIndex:', err);
  }

  return newProfile;
}

/**
 * Find user by Student ID (e.g. MIMI-A3F9-K2L1)
 */
export async function findUserByStudentId(
  inputStudentId: string
): Promise<{ uid: string; studentId: string; displayName: string; photoURL?: string } | null> {
  const normalized = normalizeStudentId(inputStudentId);
  try {
    const indexRef = doc(db, 'studentIdIndex', normalized);
    const snap = await getDoc(indexRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        uid: data.uid,
        studentId: normalized,
        displayName: data.displayName || 'Teman Belajar',
        photoURL: data.photoURL || '',
      };
    }

    // Fallback: search users collection
    const usersCol = collection(db, 'users');
    const q = query(usersCol, limit(100));
    const userDocs = await getDocs(q);
    for (const d of userDocs.docs) {
      const udata = d.data();
      if (udata.studentId && normalizeStudentId(udata.studentId) === normalized) {
        return {
          uid: d.id,
          studentId: normalized,
          displayName: udata.displayName || 'Teman Belajar',
          photoURL: udata.photoURL || '',
        };
      }
    }
  } catch (err) {
    console.error('Error finding user by student ID:', err);
  }
  return null;
}

/**
 * 30-Day Display Name Validation & Update
 */
export interface NameChangeValidation {
  allowed: boolean;
  message?: string;
  nextAllowedDate?: string;
  daysRemaining?: number;
}

export function validateNameChangeCooldown(
  lastNameChange: number | null | undefined
): NameChangeValidation {
  if (!lastNameChange) {
    return { allowed: true };
  }

  const COOLDOWN_DAYS = 30;
  const cooldownMs = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  const elapsed = Date.now() - lastNameChange;

  if (elapsed < cooldownMs) {
    const remainingMs = cooldownMs - elapsed;
    const daysRemaining = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
    const nextAllowed = new Date(lastNameChange + cooldownMs);
    const dateFormatted = nextAllowed.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return {
      allowed: false,
      message: `Kamu bisa ganti nama lagi pada ${dateFormatted} (tersisa ${daysRemaining} hari).`,
      nextAllowedDate: dateFormatted,
      daysRemaining,
    };
  }

  return { allowed: true };
}

/**
 * Update display name with 30-day throttle check
 */
export async function updateStudentDisplayName(
  uid: string,
  newDisplayName: string,
  currentStudentId?: string,
  currentLastNameChange?: number | null
): Promise<{ success: boolean; message: string; updatedName?: string }> {
  const trimmed = newDisplayName.trim();
  if (!trimmed || trimmed.length < 2) {
    return { success: false, message: 'Nama harus minimal 2 karakter.' };
  }
  if (trimmed.length > 50) {
    return { success: false, message: 'Nama maksimal 50 karakter.' };
  }

  // 1. Check cooldown
  const check = validateNameChangeCooldown(currentLastNameChange);
  if (!check.allowed) {
    return { success: false, message: check.message! };
  }

  const now = Date.now();

  try {
    // 2. Update Firestore user document
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      displayName: trimmed,
      lastNameChange: now,
      updatedAt: serverTimestamp(),
    });

    // 3. Update studentIdIndex if available
    if (currentStudentId) {
      try {
        const indexRef = doc(db, 'studentIdIndex', currentStudentId);
        await setDoc(
          indexRef,
          {
            displayName: trimmed,
            updatedAt: now,
          },
          { merge: true }
        );
      } catch {
        // ignore index update error
      }
    }

    // 4. Update Firebase Auth Profile
    if (auth.currentUser && auth.currentUser.uid === uid) {
      await updateProfile(auth.currentUser, { displayName: trimmed });
    }

    return {
      success: true,
      message: `Nama berhasil diubah menjadi "${trimmed}". Perubahan berikutnya dapat dilakukan setelah 30 hari.`,
      updatedName: trimmed,
    };
  } catch (err: any) {
    console.error('Failed to update student name:', err);
    return {
      success: false,
      message: err?.message || 'Gagal memperbarui nama di database.',
    };
  }
}

/**
 * Add Friend by Student ID with bidirectional link
 */
export async function addFriendByStudentId(
  currentUid: string,
  currentUserStudentId: string,
  currentUserDisplayName: string,
  targetStudentIdInput: string
): Promise<{ success: boolean; message: string; friend?: StudentFriend }> {
  const normalizedTargetId = normalizeStudentId(targetStudentIdInput);

  if (normalizedTargetId === normalizeStudentId(currentUserStudentId)) {
    return {
      success: false,
      message: 'Kamu tidak bisa menambahkan dirimu sendiri sebagai teman.',
    };
  }

  // 1. Find target user
  const targetUser = await findUserByStudentId(normalizedTargetId);
  if (!targetUser) {
    return {
      success: false,
      message: `ID Siswa "${normalizedTargetId}" tidak ditemukan. Pastikan format MIMI-XXXX-XXXX sudah benar.`,
    };
  }

  if (targetUser.uid === currentUid) {
    return {
      success: false,
      message: 'Kamu tidak bisa menambahkan dirimu sendiri sebagai teman.',
    };
  }

  // 2. Check if already friends
  const myFriendRef = doc(db, 'users', currentUid, 'friends', targetUser.uid);
  const existingSnap = await getDoc(myFriendRef);
  if (existingSnap.exists()) {
    return {
      success: false,
      message: `Kamu sudah berteman dengan ${targetUser.displayName} (${targetUser.studentId})!`,
    };
  }

  const now = Date.now();
  const friendDataForMe: StudentFriend = {
    friendUid: targetUser.uid,
    friendStudentId: targetUser.studentId,
    friendDisplayName: targetUser.displayName,
    friendPhotoUrl: targetUser.photoURL,
    status: 'accepted',
    addedAt: now,
  };

  const friendDataForThem: StudentFriend = {
    friendUid: currentUid,
    friendStudentId: currentUserStudentId,
    friendDisplayName: currentUserDisplayName,
    status: 'accepted',
    addedAt: now,
  };

  try {
    // Bidirectional friendship
    await setDoc(myFriendRef, friendDataForMe);
    await setDoc(doc(db, 'users', targetUser.uid, 'friends', currentUid), friendDataForThem);

    return {
      success: true,
      message: `Berhasil menambahkan ${targetUser.displayName} (${targetUser.studentId}) sebagai teman belajar!`,
      friend: friendDataForMe,
    };
  } catch (err: any) {
    console.error('Failed to add friend:', err);
    return {
      success: false,
      message: err?.message || 'Gagal menyimpan data teman di Firestore.',
    };
  }
}

/**
 * Real-time listener for friends subcollection
 */
export function subscribeToFriends(
  uid: string,
  onUpdate: (friends: StudentFriend[]) => void,
  onError?: (err: any) => void
): () => void {
  const friendsCol = collection(db, 'users', uid, 'friends');
  return onSnapshot(
    friendsCol,
    (snapshot) => {
      const list: StudentFriend[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as StudentFriend);
      });
      // Sort most recent first
      list.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
      onUpdate(list);
    },
    (err) => {
      console.warn('Friends snapshot error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Record Game / Duel History to Firestore subcollection
 */
export async function recordGameHistory(
  uid: string,
  entry: Omit<GameHistoryEntry, 'id' | 'timestamp'>
): Promise<void> {
  if (!uid || uid === 'usr_public_visitor') return;
  const historyCol = collection(db, 'users', uid, 'gameHistory');
  const docId = `gh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  try {
    await setDoc(doc(historyCol, docId), {
      ...entry,
      id: docId,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.warn('Failed to record game history in Firestore:', err);
  }
}

export interface DuelQuestionAnswerRecord {
  questionHash: string; // 10-char hash
  questionText: string;
  level: string;
  category: string;
  answeredAt: number;
  wasCorrect: boolean;
}

/**
 * Record individual answered question to users/{uid}/duelHistory/{questionHash}
 * Guarantees zero repeat questions across all duel sessions
 */
export async function recordDuelQuestionAnswer(
  uid: string,
  record: DuelQuestionAnswerRecord
): Promise<void> {
  if (!uid || uid === 'usr_public_visitor') return;
  try {
    const docRef = doc(db, 'users', uid, 'duelHistory', record.questionHash);
    await setDoc(docRef, {
      ...record,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.warn('Failed to record duel question in Firestore:', err);
  }
}

export interface DuelSessionRecord {
  sessionId: string;
  arenaTitle: string;
  category: string;
  level: string;
  playerScore: number;
  opponentScore: number;
  opponentName: string;
  result: 'menang' | 'kalah' | 'imbang';
  xpEarned: number;
  totalQuestions: number;
  correctAnswers: number;
  timestamp: number;
}

/**
 * Record duel session to users/{uid}/duelSessions/{sessionId} and increment totalDuelPlayed
 */
export async function recordDuelSession(
  uid: string,
  session: DuelSessionRecord
): Promise<void> {
  if (!uid || uid === 'usr_public_visitor') return;
  try {
    // 1. Record session
    const sessionDocRef = doc(db, 'users', uid, 'duelSessions', session.sessionId);
    await setDoc(sessionDocRef, session);

    // 2. Increment totalDuelPlayed in user profile
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      totalDuelPlayed: increment(1),
      lastDuelAt: Date.now(),
    }).catch(async () => {
      // If updateDoc fails (e.g. field doesn't exist), set with merge
      await setDoc(userDocRef, { totalDuelPlayed: 1, lastDuelAt: Date.now() }, { merge: true });
    });
  } catch (err) {
    console.warn('Failed to record duel session in Firestore:', err);
  }
}

/**
 * Get recent question hashes from Firestore to strictly exclude in prompt and local generator
 */
export async function getUserDuelHistoryHashes(uid: string, maxLimit = 500): Promise<string[]> {
  if (!uid || uid === 'usr_public_visitor') return [];
  try {
    const historyCol = collection(db, 'users', uid, 'duelHistory');
    const q = query(historyCol, limit(maxLimit));
    const snap = await getDocs(q);
    const hashes: string[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data.questionHash) hashes.push(data.questionHash);
    });
    return hashes;
  } catch {
    return [];
  }
}

/**
 * Get user's total duel count from users/{uid}
 */
export async function getUserTotalDuelPlayed(uid: string): Promise<number> {
  if (!uid || uid === 'usr_public_visitor') return 0;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return Number(snap.data()?.totalDuelPlayed) || 0;
    }
    return 0;
  } catch {
    return 0;
  }
}

