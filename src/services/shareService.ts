/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SHARE PENCAPAIAN 4 PLATFORM (IG STORY, THREADS, TIKTOK, STORY WA) — MIMI V15 V2
 * - PUBLIC_LINKS.duelRoom(mimiId) => https://mimi15.asia/duel?invite=${mimiId}&ref=share
 * - getShareCaption(data) => Caption otomatis dengan link publik yang bisa diklik langsung ke room
 */

import { LevelBadge } from '../components/DevBadge';
import { getOrCreateMimiId } from './mimiAuthService';
import { BASE_URL } from './userStatsService';

export const WA_NUMBER = '6282148184782';
export const WA_MESSAGE_SHORTLINK = 'https://wa.me/message/2CFS37UB7TKUA1';
export const WA_EXACT_MESSAGE = 'Halo Mimi_Real, aku mau bertanya nih, boleh gak?';
export const WA_ENCODED_MESSAGE = encodeURIComponent(WA_EXACT_MESSAGE);

export const WA_MIMI_REAL_URL = `https://wa.me/6282148184782?text=${WA_ENCODED_MESSAGE}`;
export const WA_MIMI_REAL_SHORTLINK_URL = `https://wa.me/message/2CFS37UB7TKUA1?text=${WA_ENCODED_MESSAGE}`;

export function handleChatMimiReal(customMsg?: string): void {
  const msg = customMsg ? encodeURIComponent(customMsg) : WA_ENCODED_MESSAGE;
  const url = `https://wa.me/6282148184782?text=${msg}`;
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

export function handleShareWA(customLink?: string): void {
  const textToShare = customLink ? `${WA_EXACT_MESSAGE}\n${customLink}` : WA_EXACT_MESSAGE;
  const url = `https://wa.me/?text=${encodeURIComponent(textToShare)}`;
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

export function handleInviteWA(mimiId?: string): void {
  const textToShare = mimiId
    ? `Halo Mimi_Real, aku mau bertanya nih, boleh gak? (Room Invite: ${mimiId})`
    : WA_EXACT_MESSAGE;
  const url = `https://wa.me/?text=${encodeURIComponent(textToShare)}`;
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

export interface MimiShareData {
  name: string;
  mimiId: string;
  score: number;
  rank: number;
  badge: LevelBadge | string;
  matchProgress: number; // Match X/100
  isCreator?: boolean;
  reasonTitle?: string;
}

export const PUBLIC_LINKS = {
  duelRoom: (mimiId: string): string => {
    const cleanId = (mimiId || getOrCreateMimiId()).trim().toUpperCase();
    return `${BASE_URL}/duel?invite=${encodeURIComponent(cleanId)}`;
  },
  appDeepLink: (mimiId: string): string => {
    const cleanId = (mimiId || getOrCreateMimiId()).trim().toUpperCase();
    return `${BASE_URL}/?invite=${encodeURIComponent(cleanId)}`;
  },
};

/**
 * Menghasilkan caption singkat otomatis untuk dibagikan ke WA Story, IG, Threads, & TikTok:
 * `⚔️ Aku menang Duel di MIMI V15! Skor 950 🔥 Rank #1 • Ahli 👑 • MIMI-A1B2 Mabar yuk? Klik langsung masuk room ku: https://mimi15.asia/duel?invite=MIMI-A1B2&ref=share #MimiV15`
 */
export function getShareCaption(data: MimiShareData): string {
  const mimiId = (data.mimiId || getOrCreateMimiId()).trim().toUpperCase();
  const score = Number.isFinite(data.score) ? data.score : 950;
  const rank = Number.isFinite(data.rank) && data.rank > 0 ? data.rank : 1;
  const badge = data.badge || 'Ahli';
  const roomUrl = PUBLIC_LINKS.duelRoom(mimiId);

  return `⚔️ Aku menang Duel di MIMI V15! Skor ${score} 🔥 Rank #${rank} • ${badge} 👑 • ${mimiId} Mabar yuk? Klik langsung masuk room ku: ${roomUrl} #MimiV15`;
}

/**
 * Mengonversi DataURL PNG dari canvas menjadi objek File untuk Web Share API.
 */
export async function dataUrlToPngFile(
  dataUrl: string,
  filename = 'mimi-v15-achievement.png'
): Promise<File | null> {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: 'image/png' });
  } catch {
    return null;
  }
}

/**
 * Mengunduh gambar kartu pencapaian 1080x1920 PNG ke perangkat user.
 */
export function downloadShareCardPng(dataUrl: string, mimiId: string): void {
  if (typeof document === 'undefined' || !dataUrl) return;
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `MIMI-V15-${mimiId}-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
