/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export type Kelas = 'SD' | 'SMP' | 'SMA' | 'SMK' | 'Umum';
export type Level = 'Pemula' | 'Menengah' | 'Mahir' | 'Ahli';

export interface ArenaState {
  selectedKelas: Kelas;
  selectedLevel: Level;
  setKelas: (kelas: Kelas, userId?: string) => Promise<void>;
  setLevel: (level: Level, userId?: string) => Promise<void>;
  loadFromFirestore: (userId: string) => Promise<void>;
}

export const useArenaStore = create<ArenaState>()(
  persist(
    (set, get) => ({
      selectedKelas: 'Umum',
      selectedLevel: 'Pemula',

      // KETIKA KLIK KELAS - SIMPAN KE FIRESTORE + LOCAL
      setKelas: async (kelas: Kelas, userId?: string) => {
        set({ selectedKelas: kelas });
        if (userId && userId !== 'usr_public_visitor') {
          try {
            await setDoc(
              doc(db, 'users', userId),
              { preferences: { kelas, level: get().selectedLevel } },
              { merge: true }
            );
          } catch (err) {
            console.warn('Gagal sync preferences kelas ke Firestore:', err);
          }
        }
      },

      // KETIKA KLIK LEVEL - SIMPAN KE FIRESTORE + LOCAL
      setLevel: async (level: Level, userId?: string) => {
        set({ selectedLevel: level });
        if (userId && userId !== 'usr_public_visitor') {
          try {
            await setDoc(
              doc(db, 'users', userId),
              { preferences: { kelas: get().selectedKelas, level } },
              { merge: true }
            );
          } catch (err) {
            console.warn('Gagal sync preferences level ke Firestore:', err);
          }
        }
      },

      // LOAD SAAT LOGIN GOOGLE
      loadFromFirestore: async (userId: string) => {
        if (!userId || userId === 'usr_public_visitor') return;
        try {
          const snap = await getDoc(doc(db, 'users', userId));
          if (snap.exists()) {
            const pref = snap.data()?.preferences;
            if (pref) {
              set({
                selectedKelas: (pref.kelas as Kelas) || 'Umum',
                selectedLevel: (pref.level as Level) || 'Pemula',
              });
            }
          }
        } catch (err) {
          console.warn('Gagal load preferences dari Firestore:', err);
        }
      },
    }),
    {
      name: 'mimi-arena-storage', // simpan permanen di localStorage
    }
  )
);
