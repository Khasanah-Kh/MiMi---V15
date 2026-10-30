/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * MUSIC SERVICE — MIMI V15 (DELEGATES TO DUEL MUSIC SERVICE)
 * Memastikan tidak ada musik yang berputar di luar ruang duel dan anti-tabrakan.
 */

import {
  BGM_FILES,
  DuelBgmLevel,
  normalizeDuelBgmLevel,
  playDuelBgm,
  stopAllBgm,
} from './duelMusicService';

export type BgmLevelKey = DuelBgmLevel;
export const BGM_MAP = BGM_FILES;

export const BGM_BPM_INFO: Record<string, string> = {
  pemula: 'Pemula',
  menengah: 'Menengah',
  mahir: 'Mahir',
  ahli: 'Ahli',
};

const MUTE_STORAGE_KEY = 'mimi15_arena_bgm_muted';

export function normalizeBgmLevel(level?: string | null): BgmLevelKey {
  return normalizeDuelBgmLevel(level);
}

export function isBgmMuted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
}

export function setBgmMuted(muted: boolean): boolean {
  if (typeof window === 'undefined') return muted;
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, muted ? 'true' : 'false');
  } catch {}
  if (muted) {
    stopAllBgm();
  }
  return muted;
}

export function toggleBgmMute(): boolean {
  const nextMuted = !isBgmMuted();
  return setBgmMuted(nextMuted);
}

export function playBgm(rawLevel: string, volume = 0.5): void {
  if (isBgmMuted()) {
    stopAllBgm();
    return;
  }
  playDuelBgm(rawLevel, volume);
}

export function stopBgm(): void {
  stopAllBgm();
}
