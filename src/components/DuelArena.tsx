import React, { useState, useEffect } from 'react';
import { useArenaStore, Kelas, Level } from '../store/useArenaStore';
import { DevBadge, LevelBadge, getLevelBadge, getBadgeColor, CREATOR_NAME, CREATOR_EMAIL } from './DevBadge';
import { fireLevelUpConfetti } from './LevelUpConfettiCelebration';
import { calculateLevelFromXp } from '../data/curriculumData';
import { get100AskedIds } from '../services/questionService';
import { playDuelBgm, stopAllBgm } from '../services/duelMusicService';
import {
  getOrCreateMimiId,
  getCachedSocialFriends,
  syncSocialFriends,
  MimiSocialFriend,
} from '../services/mimiAuthService';
import FriendProfileModal from './FriendProfileModal';
import { MimiShareModal } from './MimiShareCard';

import { recordUserMatch } from '../services/userStatsService';

interface Player {
  id: string;
  name: string;
  isBot: boolean;
  totalScore: number;
  isCreator?: boolean;
  mimiId?: string;
}

export default function DuelArena() {
  const { selectedKelas, selectedLevel, setKelas, setLevel } = useArenaStore();
  const asked = get100AskedIds();
  const matchKe = Math.min(100, Math.floor(asked.length / 10) + 1);
  const myMimiId = getOrCreateMimiId();

  // 1. NAMA PENCIPTA PERMANEN
  const creatorName = CREATOR_NAME;
  const creatorEmail = CREATOR_EMAIL;

  // 2. LEADERBOARD - RAKHA DLL ADALAH BOT
  const [players, setPlayers] = useState<Player[]>([
    { id: 'bot1', name: 'Rakha', isBot: true, totalScore: 1200, mimiId: 'MIMI-RKH1' },
    { id: 'bot2', name: 'Cyber Bot Mimi', isBot: true, totalScore: 850, mimiId: 'MIMI-BOT2' },
    { id: 'bot3', name: 'Siswa Umum', isBot: true, totalScore: 600, mimiId: 'MIMI-UMM3' },
    { id: 'user_real', name: creatorName, isBot: false, totalScore: 0, isCreator: true, mimiId: myMimiId },
  ]);

  // BGM HANYA PLAY SAAT DI DALAM RUANG DUEL AKTIF (BUKAN DI PILIH LEVEL LUAR)
  const currentLevel = selectedLevel.toLowerCase() as 'pemula' | 'menengah' | 'mahir' | 'ahli';
  const [inDuelRoom, setInDuelRoom] = useState(false);

  useEffect(() => {
    if (inDuelRoom) {
      stopAllBgm();
      playDuelBgm(currentLevel, 0.5);
    } else {
      stopAllBgm();
    }
    return () => {
      stopAllBgm();
    };
  }, [inDuelRoom, currentLevel]);

  // Teman Sosmed IG/TikTok/Threads & Modal Profil Teman
  const [socialFriends, setSocialFriends] = useState<MimiSocialFriend[]>(() => getCachedSocialFriends());
  const [selectedFriendMimiId, setSelectedFriendMimiId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [inviteDuelMessage, setInviteDuelMessage] = useState<string | null>(null);

  // Deep link ?invite=MIMI-ID otomatis buka profil teman & ajak duel
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const inviteId = params.get('invite');
    if (inviteId && inviteId.trim()) {
      setSelectedFriendMimiId(inviteId.trim().toUpperCase());
    }
  }, []);

  // 3. RUMUS SKOR - PINTAR & ADIL
  const calculateScore = (isCorrect: boolean, secondsTaken: number) => {
    if (!isCorrect) return 0; // TASK 4: SALAH = 0
    // TASK 3 & 5: BENAR = 100 - (detik * 5), minimal 10
    const score = Math.max(10, 100 - secondsTaken * 5);
    return score;
  };

  // SIMULASI BOT PINTAR
  const simulateBot = () => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (!p.isBot) return p;
        const secondsTaken = Math.floor(Math.random() * 7) + 2; // 2-8 detik
        const isCorrect = Math.random() > 0.15; // 85% benar (pintar)
        const score = calculateScore(isCorrect, secondsTaken);
        return { ...p, totalScore: p.totalScore + score };
      })
    );
  };

  // SAAT SISWA JAWAB
  const handleStudentAnswer = (isCorrect: boolean, secondsTaken: number) => {
    const score = calculateScore(isCorrect, secondsTaken);
    recordUserMatch(myMimiId, score, 50, isCorrect);
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== 'user_real') return p;
        const nextScore = p.totalScore + score;
        if (
          score > 0 &&
          (calculateLevelFromXp(nextScore) > calculateLevelFromXp(p.totalScore) ||
            getLevelBadge(nextScore) !== getLevelBadge(p.totalScore))
        ) {
          fireLevelUpConfetti();
          setShowShareModal(true);
        }
        return { ...p, totalScore: nextScore };
      })
    );
    simulateBot(); // Bot juga jawab bareng
  };

  // SORT PERINGKAT REAL-TIME
  const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);
  const userPlayer = sortedPlayers.find((p) => p.id === 'user_real') || players[3];
  const userRank = sortedPlayers.findIndex((p) => p.id === 'user_real') + 1;

  const kelasList: Kelas[] = ['SD', 'SMP', 'SMA', 'SMK', 'Umum'];
  const levelList: Level[] = ['Pemula', 'Menengah', 'Mahir', 'Ahli'];

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-[#0e1526] border border-slate-800 text-white">
      {/* BADGE ATAS OTOMATIS + TOMBOL SHARE 4 PLATFORM (TANPA BGM PLAYER DI LUAR DUEL) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-extrabold tracking-wide">
          TARGET: {selectedKelas.toUpperCase()} • Level {selectedLevel} • ID: {myMimiId}
        </div>

        <div className="flex items-center gap-2">
          {inDuelRoom ? (
            <button
              type="button"
              onClick={() => {
                stopAllBgm();
                setInDuelRoom(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs font-bold text-rose-300"
            >
              Keluar dari Duel (Stop BGM)
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                stopAllBgm();
                setInDuelRoom(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-sky-500 text-slate-950 text-xs font-black"
            >
              ⚔️ Masuk Ruang Duel (1,2,3)
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#8A2BE2] to-[#FF6B9D] text-white text-xs font-black shadow-md"
          >
            🚀 Share 4 Platform
          </button>
        </div>
      </div>

      {/* PROGRESS 100 MATCH ANTI-ULANG */}
      <div className="text-xs text-cyan-400 space-y-1">
        <div>🎯 Match {matchKe}/100 • Soal Unik: {asked.length}/1000 Anti-Ulang</div>
        <progress value={asked.length} max={1000} className="w-full h-1" />
      </div>

      {/* TOMBOL KELAS - SEMUA NGIKUT */}
      <div className="flex flex-wrap gap-2">
        {kelasList.map((k) => (
          <button
            key={k}
            onClick={() => setKelas(k)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedKelas === k
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      {/* TOMBOL LEVEL - SAMA */}
      <div className="flex flex-wrap gap-2">
        {levelList.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedLevel === l
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* TEMAN SOSMED IG/TIKTOK/THREADS (KLIK AVATAR -> LIHAT PROFIL TEMAN LENGKAP) */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-purple-500/30 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-extrabold text-pink-300">
            👥 Teman IG / TikTok / Threads di Room Mimi (Klik Avatar untuk Lihat Profil)
          </div>
          <button
            type="button"
            onClick={async () => {
              const res = await syncSocialFriends(true);
              setSocialFriends(res.friends);
            }}
            className="px-2.5 py-1 rounded-lg bg-purple-600/30 border border-purple-400/40 text-[11px] font-bold text-purple-200 hover:bg-purple-600/50"
          >
            🔄 Sync Teman
          </button>
        </div>

        {inviteDuelMessage && (
          <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
            {inviteDuelMessage}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {socialFriends.map((f) => (
            <button
              key={f.mimiId}
              type="button"
              onClick={() => setSelectedFriendMimiId(f.mimiId)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-pink-400/50 transition-all"
            >
              <div className="w-7 h-7 rounded-full border border-pink-400/60 bg-slate-900 flex items-center justify-center text-xs">
                {f.avatarEmoji || f.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white leading-tight">{f.name}</div>
                <div className="text-[10px] font-mono text-amber-300">{f.mimiId} • {f.badge}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* LEADERBOARD DENGAN BADGE LEVEL SESUAI SKOR */}
      <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        {sortedPlayers.map((player, index) => {
          const levelBadge: LevelBadge = getLevelBadge(player.totalScore);
          return (
            <div key={player.id} className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-amber-400 text-xs w-6">#{index + 1}</span>
                <button
                  type="button"
                  onClick={() => setSelectedFriendMimiId(player.mimiId || myMimiId)}
                  className="font-bold text-sm inline-flex items-center gap-1.5 hover:text-pink-300 transition-colors"
                  title="Klik untuk lihat profil & pencapaian"
                >
                  {player.name}
                  {player.isCreator && <DevBadge size="xs" title={creatorEmail} />}
                  {player.isBot && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 text-[9px] font-bold">
                      🤖 BOT
                    </span>
                  )}
                </button>
                {/* BADGE PERINGKAT SESUAI SKOR TERTINGGI */}
                <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${getBadgeColor(levelBadge)}`}>
                  {levelBadge}
                </span>
              </div>
              <span className="font-black text-sky-400 text-sm">{player.totalScore} Poin</span>
            </div>
          );
        })}
      </div>

      {/* CONTOH TOMBOL JAWAB */}
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          onClick={() => handleStudentAnswer(true, 1)}
          className="px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold hover:bg-emerald-500/30 transition-all"
        >
          Jawab Benar Cepat (1 detik = 95 poin)
        </button>
        <button
          onClick={() => handleStudentAnswer(false, 5)}
          className="px-3 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-extrabold hover:bg-rose-500/30 transition-all"
        >
          Jawab Salah (0 poin)
        </button>
      </div>

      {/* MODAL PROFIL TEMAN */}
      {selectedFriendMimiId && (
        <FriendProfileModal
          friendMimiId={selectedFriendMimiId}
          onClose={() => setSelectedFriendMimiId(null)}
          onChallengeFriend={(mimiId, name) => {
            setSelectedFriendMimiId(null);
            setInviteDuelMessage(`⚔️ Undangan Mabar Duel terkirim ke ${name} (${mimiId})! Link room: mimi15.asia/duel?invite=${mimiId}`);
          }}
        />
      )}

      {/* MODAL SHARE 4 PLATFORM */}
      {showShareModal && (
        <MimiShareModal
          data={{
            name: creatorName,
            score: userPlayer?.totalScore || 950,
            rank: userRank || 1,
            badge: getLevelBadge(userPlayer?.totalScore || 950),
            mimiId: myMimiId,
            matchProgress: matchKe,
            isCreator: true,
          }}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
