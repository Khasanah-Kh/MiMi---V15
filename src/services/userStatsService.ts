/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * REAL USER STATS SERVICE — MIMI V15
 * Menghitung match, streak, win rate, dan badge LEGEND 100 secara REAL tanpa data dummy/palsu.
 * APP_RELEASE_DATE = '2025-10-27'
 * BASE_URL = 'https://ais-pre-uujm7563cz27mgl63kqjrj-141953450050.asia-southeast1.run.app'
 */

export const APP_RELEASE_DATE = '2025-10-27';
export const BASE_URL = 'https://ais-pre-uujm7563cz27mgl63kqjrj-141953450050.asia-southeast1.run.app';

export interface UserMatchRecord {
  id: string;
  score: number;
  botScore?: number;
  win?: boolean;
  timestamp: number;
}

export interface RealUserStats {
  matchCount: number;
  totalScore: number;
  wins: number;
  losses: number;
  winRate: number;
  streak: number;
  hasLegendBadge: boolean;
}

export function getRealUserStats(mimiId: string): RealUserStats {
  if (typeof window === 'undefined' || !mimiId) {
    return {
      matchCount: 0,
      totalScore: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      streak: 1,
      hasLegendBadge: false,
    };
  }

  const cleanMimiId = mimiId.trim().toUpperCase();
  const matches: UserMatchRecord[] = JSON.parse(
    localStorage.getItem(`mimi_matches_${cleanMimiId}`) || '[]'
  );
  const loginDays: string[] = JSON.parse(
    localStorage.getItem(`mimi_login_days_${cleanMimiId}`) || '[]'
  );

  const matchCount = matches.length; // real match count
  const totalScore = matches.reduce((s: number, m: UserMatchRecord) => s + (m.score || 0), 0);
  const wins = matches.filter(
    (m: UserMatchRecord) => m.win || (m.score || 0) > (m.botScore || 0)
  ).length;
  const losses = Math.max(0, matchCount - wins);
  const winRate = matchCount > 0 ? Math.round((wins / matchCount) * 100) : 0;
  const streak = calculateStreak(loginDays);

  return {
    matchCount,
    totalScore,
    wins,
    losses,
    winRate,
    streak,
    hasLegendBadge: matchCount >= 100, // Cuma boleh muncul kl udh 100 match beneran!
  };
}

export function calculateStreak(days: string[]): number {
  if (!days || days.length === 0) return 1;
  const uniqueDays = Array.from(new Set(days)).sort();

  const release = new Date(APP_RELEASE_DATE);
  const now = new Date();
  const maxAllowedDays = Math.max(
    1,
    Math.floor((now.getTime() - release.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );

  let currentStreak = 0;
  let checkDate = new Date();
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (uniqueDays.includes(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return Math.max(1, Math.min(currentStreak, maxAllowedDays));
}

export function recordUserMatch(mimiId: string, score: number, botScore: number = 0, win?: boolean): void {
  if (typeof window === 'undefined' || !mimiId) return;
  try {
    const cleanMimiId = mimiId.trim().toUpperCase();
    const matches: UserMatchRecord[] = JSON.parse(
      localStorage.getItem(`mimi_matches_${cleanMimiId}`) || '[]'
    );
    const newRecord: UserMatchRecord = {
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      score,
      botScore,
      win: win !== undefined ? win : score > botScore,
      timestamp: Date.now(),
    };
    matches.push(newRecord);
    localStorage.setItem(`mimi_matches_${cleanMimiId}`, JSON.stringify(matches));
  } catch {}
}

export function recordLoginDay(mimiId: string): void {
  if (typeof window === 'undefined' || !mimiId) return;
  try {
    const cleanMimiId = mimiId.trim().toUpperCase();
    const todayStr = new Date().toISOString().split('T')[0];
    const days: string[] = JSON.parse(
      localStorage.getItem(`mimi_login_days_${cleanMimiId}`) || '[]'
    );
    if (!days.includes(todayStr)) {
      days.push(todayStr);
      localStorage.setItem(`mimi_login_days_${cleanMimiId}`, JSON.stringify(days));
    }
  } catch {}
}
