/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * FRIEND PROFILE MODAL — MIMI V15 V2
 * Menampilkan profil lengkap teman di Room Mimi saat avatar di-tap atau dari Deep Link `?invite=MIMI-ID`:
 * - Header gradient ungu-pink #8A2BE2 -> #FF6B9D
 * - Avatar w-24 h-24, Nama, MIMI ID Permanen, Badge Level
 * - Rank #X, Total Skor, Match X/100, Win/Lose, Win Rate %, Streak harian
 * - List Badges (Ahli, Pejuang V1-V15, Pahlawan Typo, LEGEND 100 Match)
 * - Sosmed Terhubung badge (📸 IG Terhubung / 🎵 TikTok Terhubung / 🧵 Threads Terhubung) Mode Aman
 * - Tombol ⚔️ Ajak Mabar Duel -> invite mimi15.asia/duel?invite=MIMI-ID
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Swords,
  Trophy,
  Flame,
  ShieldCheck,
  Check,
  Copy,
  Lock,
  UserPlus,
  Sparkles,
} from 'lucide-react';
import {
  MimiFriendProfile,
  getFriendProfileByMimiId,
  getSyncedSocialFriends,
} from '../services/mimiAuthService';
import { PUBLIC_LINKS } from '../services/shareService';
import { DevBadge, getBadgeColor, LevelBadge } from './DevBadge';
import { getRealUserStats, BASE_URL } from '../services/userStatsService';

interface FriendProfileModalProps {
  friend?: MimiFriendProfile | null;
  friendMimiId?: string | null;
  onClose: () => void;
  onInviteDuel?: (friend: MimiFriendProfile, inviteLink: string) => void;
  onChallengeFriend?: (mimiId: string, name: string) => void;
  onAddAsMimiFriend?: (friend: MimiFriendProfile) => void;
}

export const FriendProfileModal: React.FC<FriendProfileModalProps> = ({
  friend: friendProp,
  friendMimiId,
  onClose,
  onInviteDuel,
  onChallengeFriend,
  onAddAsMimiFriend,
}) => {
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [unlockedFriend, setUnlockedFriend] = useState(false);
  const [resolvedFriend, setResolvedFriend] = useState<MimiFriendProfile | null>(() => {
    if (friendProp) return friendProp;
    if (friendMimiId) {
      const cached = getSyncedSocialFriends().find(
        (f) => f.mimiId.toUpperCase() === friendMimiId.trim().toUpperCase()
      );
      if (cached) return cached;
    }
    return null;
  });

  useEffect(() => {
    if (friendProp) {
      setResolvedFriend(friendProp);
      return;
    }
    if (friendMimiId) {
      let active = true;
      getFriendProfileByMimiId(friendMimiId).then((prof) => {
        if (active) setResolvedFriend(prof);
      });
      return () => {
        active = false;
      };
    } else {
      setResolvedFriend(null);
    }
  }, [friendProp, friendMimiId]);

  const friend = friendProp || resolvedFriend;
  if (!friend) return null;

  const realStats = getRealUserStats(friend.mimiId);
  const matchProgress = realStats.matchCount > 0 ? realStats.matchCount : (friend.matchProgress && friend.matchProgress < 100 ? friend.matchProgress : 0);
  const totalScore = realStats.matchCount > 0 ? realStats.totalScore : (friend.totalScore || 0);
  const wins = realStats.matchCount > 0 ? realStats.wins : (friend.wins || 0);
  const losses = realStats.matchCount > 0 ? realStats.losses : (friend.losses || 0);
  const winRate = realStats.matchCount > 0 ? realStats.winRate : (friend.winRate || 0);
  const streakDays = realStats.streak;
  const hasLegendBadge = matchProgress >= 100;

  const isAllowedFullView = friend.isMimiFriend || unlockedFriend;
  const inviteUrl = PUBLIC_LINKS.duelRoom(friend.mimiId);
  const badgeColor = getBadgeColor((friend.badge as LevelBadge) || 'Ahli');

  const allBadges = Array.from(
    new Set([
      friend.badge || 'Ahli',
      ...(friend.badgesList || []).filter((b) => !b.includes('LEGEND 100 MATCH')),
      'Pejuang V1-V15',
      'Pahlawan Typo',
      ...(hasLegendBadge ? ['🏆 LEGEND 100 MATCH'] : []),
    ])
  );

  const handleInviteClick = () => {
    try {
      navigator.clipboard?.writeText(inviteUrl);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2500);
    } catch {}
    onInviteDuel?.(friend, inviteUrl);
    onChallengeFriend?.(friend.mimiId, friend.name);
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-[#0F172A] border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.75)] overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Gradient Ungu-Pink #8A2BE2 -> #FF6B9D */}
        <div className="relative pt-6 pb-14 px-6 bg-gradient-to-r from-[#8A2BE2] to-[#FF6B9D]">
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Profil Teman"
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/25 backdrop-blur-sm border border-white/20 text-[10px] font-mono font-bold uppercase tracking-wider text-white">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>PROFIL SAHABAT ROOM MIMI V15</span>
          </div>
        </div>

        {/* Avatar 24 (w-24 h-24) Overlapping Header */}
        <div className="px-6 -mt-12 relative z-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-3xl bg-[#0B1120] border-4 border-[#0F172A] shadow-xl flex items-center justify-center text-4xl font-black text-white relative overflow-hidden">
            {friend.avatarUrl ? (
              <img
                src={friend.avatarUrl}
                alt={friend.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#8A2BE2]/40 to-[#FF6B9D]/40 flex items-center justify-center">
                <span>{friend.avatarEmoji || friend.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* Nama + Badge DEV + Badge Level */}
          <div className="mt-2.5 space-y-1">
            <h3 className="text-xl font-black text-white flex items-center justify-center gap-1.5 flex-wrap">
              <span>{friend.name}</span>
              {friend.isCreator && <DevBadge size="xs" />}
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badgeColor}`}>
                {friend.badge}
              </span>
            </h3>

            {/* MIMI ID Permanen */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0B1120] border border-sky-500/40 text-xs font-mono font-black text-amber-300">
              <span>ID Mimi Permanen:</span>
              <span className="text-sky-300">{friend.mimiId}</span>
            </div>
          </div>
        </div>

        {/* Body Content (With Privacy Check) */}
        <div className="p-5 sm:p-6 space-y-4">
          {!isAllowedFullView ? (
            <div className="p-5 rounded-2xl bg-[#0B1120] border border-slate-800 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-400/40 flex items-center justify-center mx-auto text-amber-300">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-white">Mode Privasi Aman Aktif</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Hanya teman yang sudah jadi teman Mimi atau tersinkronisasi dari sosmed yang bisa melihat detail pencapaian lengkap.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUnlockedFriend(true);
                  onAddAsMimiFriend?.(friend);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Tambah &amp; Sinkronkan Teman ({friend.mimiId})</span>
              </button>
            </div>
          ) : (
            <>
              {/* 6-Stat Achievement Grid: Rank, Total Skor, Match X/100, Win/Lose, Win Rate %, Streak */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-[#0B1120] border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">Peringkat</div>
                  <div className="text-sm sm:text-base font-black text-amber-400 font-mono">
                    Rank #{friend.rank}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0B1120] border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">Total Skor</div>
                  <div className="text-sm sm:text-base font-black text-sky-400 font-mono">
                    {totalScore.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0B1120] border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">Progress Duel</div>
                  <div className="text-sm sm:text-base font-black text-cyan-300 font-mono">
                    Match {matchProgress}/100
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0B1120] border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">Win / Lose</div>
                  <div className="text-sm font-black text-emerald-400 font-mono">
                    {wins}W / {losses}L
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0B1120] border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">Win Rate</div>
                  <div className="text-sm font-black text-pink-400 font-mono">
                    {winRate}%
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0B1120] border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">Streak Harian</div>
                  <div className="text-sm font-black text-orange-400 font-mono flex items-center justify-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span>{streakDays} Hari</span>
                  </div>
                </div>
              </div>

              {/* List Badges */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Koleksi Badge Pencapaian:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {allBadges.map((b) => (
                    <span
                      key={b}
                      className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-pink-400/30 text-[11px] font-bold text-pink-200 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>{b}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Sosmed Terhubung Badges (Mode Aman) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="font-bold uppercase tracking-wider">Sosmed Terhubung:</span>
                  <span className="text-[10px] text-emerald-400">🔒 Mode Aman (Tanpa DM)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {friend.connectedSocials?.instagram && (
                    <span className="px-2.5 py-1 rounded-lg bg-pink-500/15 border border-pink-400/30 text-[11px] font-bold text-pink-300">
                      📸 IG Terhubung
                    </span>
                  )}
                  {friend.connectedSocials?.tiktok && (
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-400/30 text-[11px] font-bold text-cyan-300">
                      🎵 TikTok Terhubung
                    </span>
                  )}
                  {friend.connectedSocials?.threads && (
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-400/30 text-[11px] font-bold text-purple-300">
                      🧵 Threads Terhubung
                    </span>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Invite Link Preview + CTA Button ⚔️ Ajak Mabar Duel */}
          <div className="pt-2 space-y-2 border-t border-slate-800">
            <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#0B1120] border border-slate-800 text-[11px] font-mono text-sky-300">
              <span className="truncate">{BASE_URL}/duel?invite={friend.mimiId}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(inviteUrl);
                  setCopiedInvite(true);
                  setTimeout(() => setCopiedInvite(false), 2000);
                }}
                className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copiedInvite ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedInvite ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleInviteClick}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#8A2BE2] to-[#FF6B9D] hover:brightness-110 text-white font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <Swords className="w-4 h-4" />
              <span>⚔️ Ajak Mabar Duel ({friend.mimiId})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendProfileModal;
