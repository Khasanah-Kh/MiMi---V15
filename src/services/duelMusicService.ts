/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * DUEL MUSIC SERVICE — MIMI V15
 * - Musik HANYA play saat sudah di DALAM ruang duel (mulai saat hitungan 1, 2, 3 & Soal 1/10).
 * - Di luar ruang duel (Pilih Level, Pilih Arena, Beranda, Curhat, Coding, Rank, Kuis, Profil) 100% SILENT.
 * - Anti-Tabrakan: `stopAllBgm()` mematikan semua audio sebelum memutar BGM baru.
 * - 4 File BGM Beda Jenis Melodi & Instrumen (BUKAN playbackRate / beda kecepatan):
 *   1. pemula:   /bgm/bgm-pemula.mp3   (File lama Pemula tetap)
 *   2. menengah: /bgm/bgm-menengah.mp3 (Upbeat Quiz Game — Marimba & Rhodes Groove)
 *   3. mahir:    /bgm/bgm-mahir.mp3    (Competitive Game Show — Funky Brass & Clavinet)
 *   4. ahli:     /bgm/bgm-ahli.mp3     (Epic Final Quiz Battle — 6/8 Orchestral Strings, Choir & Timpani)
 */

import { soundService } from './soundService';

export type DuelBgmLevel = 'pemula' | 'menengah' | 'mahir' | 'ahli';

export const BGM_FILES: Record<DuelBgmLevel, string> = {
  pemula: '/bgm/bgm-pemula.mp3',     // file lama yang sudah ada, tetap pakai ini
  menengah: '/bgm/bgm-menengah.mp3', // file baru, beda jenis (Upbeat Quiz Game)
  mahir: '/bgm/bgm-mahir.mp3',       // file baru, beda jenis (Competitive Game Show)
  ahli: '/bgm/bgm-ahli.mp3',         // file baru, beda jenis (Epic Final Quiz Battle)
};

// Validasi keras: 4 file tidak boleh sama
if (
  BGM_FILES.pemula === BGM_FILES.menengah ||
  BGM_FILES.pemula === BGM_FILES.mahir ||
  BGM_FILES.pemula === BGM_FILES.ahli ||
  BGM_FILES.menengah === BGM_FILES.mahir ||
  BGM_FILES.menengah === BGM_FILES.ahli ||
  BGM_FILES.mahir === BGM_FILES.ahli
) {
  throw new Error('CRITICAL BGM ERROR: Keempat file BGM harus berbeda, tidak boleh sama!');
}

let currentAudio: HTMLAudioElement | null = null;
let currentPlayingLevel: DuelBgmLevel | null = null;

export function normalizeDuelBgmLevel(rawLevel?: string | null): DuelBgmLevel {
  const clean = String(rawLevel || 'pemula').toLowerCase().trim();
  if (clean === 'menengah') return 'menengah';
  if (clean === 'mahir') return 'mahir';
  if (clean === 'ahli') return 'ahli';
  return 'pemula';
}

/**
 * Matikan seluruh BGM dan elemen audio yang sedang berjalan (Anti-Tabrakan).
 */
export function stopAllBgm(): void {
  // 1. Matikan Web Audio synth lama jika ada
  try {
    soundService.stopDuelMusic();
  } catch {}

  // 2. Matikan instance currentAudio
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.src = '';
    } catch {}
    currentAudio = null;
  }
  currentPlayingLevel = null;

  // 3. Matikan semua elemen <audio> di DOM
  if (typeof document !== 'undefined') {
    document.querySelectorAll('audio').forEach((a) => {
      try {
        a.pause();
        a.currentTime = 0;
        a.src = '';
      } catch {}
    });
  }
}

/**
 * Memutar BGM sesuai level HANYA saat di dalam ruang duel (saat hitungan 1,2,3 & pertandingan aktif).
 * Selalu memanggil `stopAllBgm()` terlebih dahulu agar dijamin 100% anti-tabrakan.
 */
export function playDuelBgm(
  level: DuelBgmLevel | string,
  volume = 0.5
): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  const normalizedLevel = normalizeDuelBgmLevel(level);
  const clampedVol = Math.max(0, Math.min(1, volume));

  // Jika lagu level yang sama sudah sedang berputar di dalam duel, cukup sesuaikan volume tanpa reload
  if (
    currentAudio &&
    !currentAudio.paused &&
    currentPlayingLevel === normalizedLevel &&
    currentAudio.src.includes(BGM_FILES[normalizedLevel])
  ) {
    currentAudio.volume = clampedVol;
    currentAudio.playbackRate = 1.0;
    return currentAudio;
  }

  // ANTI TABRAKAN - matikan semua audio terlebih dahulu
  stopAllBgm();

  const fileUrl = BGM_FILES[normalizedLevel];
  const audio = new Audio(fileUrl);
  audio.loop = true;
  audio.playbackRate = 1.0; // Wajib 1.0 (bukan dipercepat)
  audio.volume = clampedVol;

  currentAudio = audio;
  currentPlayingLevel = normalizedLevel;

  audio.play().catch(() => {});
  return currentAudio;
}

/**
 * Mengatur volume BGM jika sedang berada di dalam ruang duel (tidak memutar audio jika di luar duel).
 */
export function updateActiveDuelBgmVolume(volume: number): void {
  const clampedVol = Math.max(0, Math.min(1, volume));
  if (currentAudio) {
    currentAudio.volume = clampedVol;
  }
}

export function isDuelBgmPlaying(): boolean {
  return Boolean(currentAudio && !currentAudio.paused);
}
