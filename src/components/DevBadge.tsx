/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const DEV_CREATOR_EMAIL = 'anna.adriiann@gmail.com';
export const CREATOR_EMAIL = DEV_CREATOR_EMAIL;
export const CREATOR_NAME = 'Mimi15_Real';

export type LevelBadge = 'Pemula' | 'Menengah' | 'Mahir' | 'Ahli';

/**
 * FUNGSI DAPETIN BADGE DARI TOTAL SKOR (TASK 2)
 */
export function getLevelBadge(totalScore: number): LevelBadge {
  if (totalScore >= 5000) return 'Ahli';
  if (totalScore >= 2500) return 'Mahir';
  if (totalScore >= 1000) return 'Menengah';
  return 'Pemula';
}

export function getBadgeColor(level: LevelBadge): string {
  switch (level) {
    case 'Pemula':
      return 'bg-gray-500 text-white';
    case 'Menengah':
      return 'bg-blue-500 text-white';
    case 'Mahir':
      return 'bg-purple-600 text-white';
    case 'Ahli':
      return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black';
  }
}

/**
 * RUMUS SKOR DUEL - PINTAR & ADIL (TASK 3, 4 & 5)
 * - Salah = 0 poin
 * - Benar = Math.max(10, 100 - (secondsTaken * 5))
 *   Contoh: Jawab benar di 1 detik -> 95 poin, 2 detik -> 90 poin
 */
export function calculateDuelScore(isCorrect: boolean, secondsTaken: number): number {
  if (!isCorrect) return 0;
  const clampedSeconds = Math.max(1, Math.round(secondsTaken));
  return Math.max(10, 100 - clampedSeconds * 5);
}

/**
 * Checks if a given email belongs to the creator / developer of Mimi-V15
 */
export function isDevUser(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === DEV_CREATOR_EMAIL.toLowerCase();
}

interface DevBadgeProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md';
  title?: string;
}

/**
 * Diamond-cut Gold DEV Badge for Mimi-V15 Creator
 * Uses authentic diamond-polygon facet clip-path (not rounded circle).
 */
export const DevBadge: React.FC<DevBadgeProps> = ({ className = '', size = 'sm', title }) => {
  const sizeStyles = {
    xs: {
      padding: 'px-2 py-[1px]',
      fontSize: 'text-[9px]',
      crownSize: 'text-[10px]',
      clip: 'polygon(6px 0%, calc(100% - 6px) 0%, 100% 50%, calc(100% - 6px) 100%, 6px 100%, 0% 50%)',
    },
    sm: {
      padding: 'px-2.5 py-0.5',
      fontSize: 'text-[10px]',
      crownSize: 'text-[11px]',
      clip: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 8px 100%, 0% 50%)',
    },
    md: {
      padding: 'px-3 py-1',
      fontSize: 'text-[11px]',
      crownSize: 'text-[13px]',
      clip: 'polygon(10px 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 10px 100%, 0% 50%)',
    },
  }[size];

  return (
    <span
      className={`inline-flex items-center align-middle select-none transition-transform hover:scale-105 active:scale-95 ${className}`}
      style={{
        filter:
          'drop-shadow(0 0 7px rgba(245, 158, 11, 0.55)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6))',
      }}
      title="👑 Developer & Pencipta Resmi Mimi-V15"
    >
      {/* Diamond-faceted Gold Plaque */}
      <span
        className={`inline-flex items-center gap-1 font-black tracking-wider uppercase text-slate-950 ${sizeStyles.padding}`}
        style={{
          background:
            'linear-gradient(135deg, #FFFDE7 0%, #FFF59D 20%, #FDD835 50%, #F57F17 85%, #E65100 100%)',
          clipPath: sizeStyles.clip,
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(0, 0, 0, 0.4)',
        }}
      >
        <span className={`${sizeStyles.crownSize} leading-none`}>👑</span>
        <span
          className={`font-mono font-black ${sizeStyles.fontSize} tracking-widest text-black drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]`}
        >
          DEV
        </span>
      </span>
    </span>
  );
};

export default DevBadge;
