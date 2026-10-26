/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Swords,
  Trophy,
  Bot,
  Users,
  Copy,
  Check,
  RotateCcw,
  Timer,
  Zap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Flame,
  Share2,
  Volume2,
  VolumeX,
  Music,
} from 'lucide-react';
import { MimiUiState, RivalProfile, DuelRoom, DuelPlayer, DuelQuestion } from '../../types/mimi';
import { DUEL_CYBER_QUESTIONS, getRandomDuelQuestions } from '../../data/duelQuizData';
import {
  createDuelRoom,
  joinDuelRoom,
  updateDuelRoomState,
  subscribeToDuelRoom,
  logActivity,
} from '../../firebase';
import { soundService } from '../../services/soundService';
import {
  AdaptiveArenaConfig,
  DUEL_CLASS_OPTIONS,
  DUEL_LEVEL_BADGES,
  DuelClassKey,
  DuelDifficultyLevel,
  DuelSubjectFilter,
  getAdaptiveArenasForClass,
  getAdaptiveQuestionsForArena,
  mapUiClassToDuelClassKey,
} from '../../services/adaptiveDuelService';

interface TantanganScreenProps {
  uiState: MimiUiState;
  onChallengeRival: (rival: RivalProfile, won: boolean, xpEarned: number) => void;
  onOpenLeaderboard?: () => void;
}

type ArenaMode = 'bot' | 'pvp' | 'rivals';

// Sound dispatcher backed by soundService
function playCyberSound(type: 'beep' | 'correct' | 'wrong' | 'victory' | 'countdown') {
  if (type === 'correct') {
    soundService.playCorrectSound();
    return;
  }
  if (type === 'wrong') {
    soundService.playWrongSound();
    return;
  }
  if (type === 'countdown') {
    soundService.playCountdownBeep(false);
    return;
  }
  if (type === 'beep') {
    soundService.playCountdownBeep(true);
    return;
  }
  if (type === 'victory') {
    soundService.playVictoryMusic();
    return;
  }
}

export const TantanganScreen: React.FC<TantanganScreenProps> = ({
  uiState,
  onChallengeRival,
  onOpenLeaderboard,
}) => {
  // Navigation & Lobby states
  const [arenaTab, setArenaTab] = useState<ArenaMode>('bot');
  const [joinRoomInput, setJoinRoomInput] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [roomErrorMessage, setRoomErrorMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Adaptive Class, Level & Subject Filter states
  const [selectedDuelClass, setSelectedDuelClass] = useState<DuelClassKey>(() =>
    mapUiClassToDuelClassKey(uiState.selectedClass, uiState.selectedEducationLevel)
  );
  const [selectedDuelLevel, setSelectedDuelLevel] = useState<DuelDifficultyLevel>('pemula');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<DuelSubjectFilter>('semua');
  const [lastPlayedArena, setLastPlayedArena] = useState<AdaptiveArenaConfig | null>(null);

  // Sync adaptive class when top-bar class/jenjang changes
  useEffect(() => {
    setSelectedDuelClass(
      mapUiClassToDuelClassKey(uiState.selectedClass, uiState.selectedEducationLevel)
    );
  }, [uiState.selectedClass, uiState.selectedEducationLevel]);

  // Active Duel State
  const [activeDuelRoom, setActiveDuelRoom] = useState<DuelRoom | null>(null);
  const [isHost, setIsHost] = useState(true);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(10);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isBgmOn, setIsBgmOn] = useState(() => soundService.isBgmEnabled());
  const [bgmVolume, setBgmVolume] = useState(() => soundService.getVolume());

  const handleToggleBgm = () => {
    soundService.resumeAudio();
    const next = soundService.toggleBgm();
    setIsBgmOn(next);
  };

  const handleVolumeChange = (newVol: number) => {
    soundService.resumeAudio();
    soundService.setVolume(newVol);
    setBgmVolume(newVol);
    if (newVol > 0 && !isBgmOn) {
      const next = soundService.toggleBgm();
      setIsBgmOn(next);
    }
  };

  // Start/Stop thrilling, clearly audible cyber duel battle music
  useEffect(() => {
    if (activeDuelRoom?.status === 'in_progress' || activeDuelRoom?.status === 'countdown') {
      if (isBgmOn) {
        soundService.startDuelMusic();
      }
    } else if (activeDuelRoom?.status !== 'finished') {
      soundService.stopDuelMusic();
    }
    return () => {
      soundService.stopDuelMusic();
    };
  }, [activeDuelRoom?.status, isBgmOn]);

  // Timer refs
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const botSimTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Current user representation in duel
  const currentPlayerUid = uiState.studentEmail || 'user_' + uiState.studentName.replace(/\s+/g, '_');
  const currentDisplayName = uiState.studentName || 'Kamu';

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. REAL-TIME FIRESTORE SUBSCRIPTION FOR PVP
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeDuelRoom || activeDuelRoom.mode !== 'pvp') return;

    const unsubscribe = subscribeToDuelRoom(
      activeDuelRoom.roomId,
      (updatedRoom) => {
        if (!updatedRoom) {
          // Room deleted or ended
          return;
        }
        setActiveDuelRoom(updatedRoom);
      },
      (err) => {
        console.warn('Realtime duel sync error:', err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [activeDuelRoom?.roomId, activeDuelRoom?.mode]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. COUNTDOWN CONTROLLER (3.. 2.. 1.. GO!)
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeDuelRoom?.status === 'countdown') {
      playCyberSound('countdown');
      const timer = setTimeout(() => {
        if (activeDuelRoom.countdown > 1) {
          const nextCountdown = activeDuelRoom.countdown - 1;
          if (activeDuelRoom.mode === 'pvp') {
            updateDuelRoomState(activeDuelRoom.roomId, { countdown: nextCountdown });
          } else {
            setActiveDuelRoom((prev) => (prev ? { ...prev, countdown: nextCountdown } : null));
          }
        } else {
          // Launch game
          if (activeDuelRoom.mode === 'pvp') {
            updateDuelRoomState(activeDuelRoom.roomId, {
              status: 'in_progress',
              currentRound: 0,
            });
          } else {
            setActiveDuelRoom((prev) =>
              prev ? { ...prev, status: 'in_progress', currentRound: 0 } : null
            );
          }
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [activeDuelRoom?.status, activeDuelRoom?.countdown, activeDuelRoom?.mode, activeDuelRoom?.roomId]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. QUESTION ROUND TIMER (10 SECONDS PER QUESTION)
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeDuelRoom?.status !== 'in_progress') return;

    setQuestionTimeLeft(10);
    setIsAnswerLocked(false);
    setSelectedAnswerIndex(null);
    setShowExplanation(false);

    if (questionTimerRef.current) clearInterval(questionTimerRef.current);

    questionTimerRef.current = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          if (questionTimerRef.current) clearInterval(questionTimerRef.current);
          handleTimeExpire();
          return 0;
        }
        if (prev <= 4) playCyberSound('beep');
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, [activeDuelRoom?.currentRound, activeDuelRoom?.status]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. BOT RESPONSE SIMULATION (DYNAMIC REALISTIC INTERVAL)
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (
      !activeDuelRoom ||
      activeDuelRoom.mode !== 'bot' ||
      activeDuelRoom.status !== 'in_progress' ||
      !activeDuelRoom.guest
    ) {
      return;
    }

    if (botSimTimerRef.current) clearTimeout(botSimTimerRef.current);

    // Realistic bot response delay: 2.2s - 4.5s
    const botDelay = Math.floor(Math.random() * 2300) + 2200;
    const currentQ = activeDuelRoom.questions[activeDuelRoom.currentRound];
    if (!currentQ) return;

    botSimTimerRef.current = setTimeout(() => {
      // 75% accuracy
      const isBotCorrect = Math.random() < 0.75;
      const botPoints = isBotCorrect ? 100 + Math.floor(Math.random() * 30) : 25;

      setActiveDuelRoom((prev) => {
        if (!prev || !prev.guest) return prev;
        const updatedGuest: DuelPlayer = {
          ...prev.guest,
          score: prev.guest.score + botPoints,
          selectedAnswer: isBotCorrect ? currentQ.correctIndex : (currentQ.correctIndex + 1) % 4,
          hasAnsweredCurrent: true,
          streak: isBotCorrect ? prev.guest.streak + 1 : 0,
        };
        return {
          ...prev,
          guest: updatedGuest,
        };
      });
    }, botDelay);

    return () => {
      if (botSimTimerRef.current) clearTimeout(botSimTimerRef.current);
    };
  }, [activeDuelRoom?.currentRound, activeDuelRoom?.status, activeDuelRoom?.mode]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. ANSWER HANDLING
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSelectAnswer = (optionIdx: number) => {
    if (!activeDuelRoom || isAnswerLocked || activeDuelRoom.status !== 'in_progress') return;

    setIsAnswerLocked(true);
    setSelectedAnswerIndex(optionIdx);
    setShowExplanation(true);

    const currentQ = activeDuelRoom.questions[activeDuelRoom.currentRound];
    const isCorrect = optionIdx === currentQ.correctIndex;
    const pointsGained = isCorrect ? 100 + questionTimeLeft * 5 : 20;

    if (isCorrect) {
      playCyberSound('correct');
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
      }
    } else {
      playCyberSound('wrong');
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([60, 40, 60]);
      }
    }

    // Stop timer
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);

    // Update active room state
    if (activeDuelRoom.mode === 'bot') {
      const updatedHost: DuelPlayer = {
        ...activeDuelRoom.host,
        score: activeDuelRoom.host.score + pointsGained,
        selectedAnswer: optionIdx,
        hasAnsweredCurrent: true,
        streak: isCorrect ? activeDuelRoom.host.streak + 1 : 0,
      };

      setActiveDuelRoom((prev) => (prev ? { ...prev, host: updatedHost } : null));

      // Wait 1.6s showing explanation then move to next question or finish
      setTimeout(() => {
        advanceDuelRound({
          ...activeDuelRoom,
          host: updatedHost,
        });
      }, 1600);
    } else {
      // PVP mode sync with Firestore
      const isPlayerHost = isHost;
      const updatedPlayer: DuelPlayer = {
        ...(isPlayerHost ? activeDuelRoom.host : activeDuelRoom.guest!),
        score:
          (isPlayerHost ? activeDuelRoom.host.score : activeDuelRoom.guest?.score || 0) +
          pointsGained,
        selectedAnswer: optionIdx,
        hasAnsweredCurrent: true,
        streak: isCorrect
          ? (isPlayerHost ? activeDuelRoom.host.streak : activeDuelRoom.guest?.streak || 0) + 1
          : 0,
      };

      const patch: Partial<DuelRoom> = isPlayerHost
        ? { host: updatedPlayer }
        : { guest: updatedPlayer };

      updateDuelRoomState(activeDuelRoom.roomId, patch);

      // Advance check
      setTimeout(() => {
        advanceDuelRound(activeDuelRoom);
      }, 1600);
    }
  };

  const handleTimeExpire = () => {
    if (isAnswerLocked || !activeDuelRoom) return;
    setIsAnswerLocked(true);
    setShowExplanation(true);
    playCyberSound('wrong');

    setTimeout(() => {
      advanceDuelRound(activeDuelRoom);
    }, 1500);
  };

  const advanceDuelRound = (room: DuelRoom) => {
    const nextRound = room.currentRound + 1;
    if (nextRound < room.totalRounds) {
      if (room.mode === 'bot') {
        setActiveDuelRoom((prev) =>
          prev
            ? {
                ...prev,
                currentRound: nextRound,
                host: { ...prev.host, selectedAnswer: null, hasAnsweredCurrent: false },
                guest: prev.guest
                  ? { ...prev.guest, selectedAnswer: null, hasAnsweredCurrent: false }
                  : null,
              }
            : null
        );
      } else {
        updateDuelRoomState(room.roomId, {
          currentRound: nextRound,
          host: { ...room.host, selectedAnswer: null, hasAnsweredCurrent: false },
          ...(room.guest
            ? { guest: { ...room.guest, selectedAnswer: null, hasAnsweredCurrent: false } }
            : {}),
        });
      }
    } else {
      // Duel finished!
      playCyberSound('victory');
      const hostScore = room.host.score;
      const guestScore = room.guest?.score || 0;
      let winnerUid: string | null = null;
      if (hostScore > guestScore) winnerUid = room.host.uid;
      else if (guestScore > hostScore) winnerUid = room.guest?.uid || null;

      const earnedXp =
        winnerUid === currentPlayerUid ? room.xpStake : Math.round(room.xpStake * 0.4);

      if (room.mode === 'bot') {
        setActiveDuelRoom((prev) =>
          prev
            ? {
                ...prev,
                status: 'finished',
                winnerUid,
              }
            : null
        );
      } else {
        updateDuelRoomState(room.roomId, {
          status: 'finished',
          winnerUid,
        });
      }

      // Notify parent applet to add XP and increase win record
      logActivity('kuis_finish', {
        email: uiState.studentEmail || 'tamu_anonim@mimi15.id',
        nama: uiState.studentName || 'Pelajar',
        mode: 'Duel Arena',
        skor: isHost ? hostScore : guestScore,
        mapel: lastPlayedArena?.title || selectedSubjectFilter,
        kelas: selectedDuelClass,
        waktu: new Date().toLocaleString('id-ID'),
      });

      onChallengeRival(
        {
          id: 'duel_arena_bot',
          name: room.guest?.displayName || 'Cyber Bot Mimi',
          title: 'Cyber Duel Arena Master',
          school: 'Cyber Arena AI',
          educationLevel: uiState.selectedEducationLevel,
          difficulty: 'Tinggi',
          xpStake: room.xpStake,
          specialty: 'Refleks Kuis Cepat & Algoritma',
          winRate: 80,
          xp: 3200,
        },
        winnerUid === currentPlayerUid,
        earnedXp
      );
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. START ADAPTIVE ARENA DUEL (10 SOAL SESUAI KELAS, MAPEL & LEVEL)
  // ─────────────────────────────────────────────────────────────────────────────
  const startAdaptiveArenaDuel = (arena: AdaptiveArenaConfig) => {
    soundService.resumeAudio();
    if (isBgmOn) {
      soundService.startDuelMusic();
    }
    setLastPlayedArena(arena);

    logActivity('duel_start', {
      email: uiState.studentEmail || 'tamu_anonim@mimi15.id',
      nama: uiState.studentName || 'Pelajar',
      kelas: selectedDuelClass,
      mapel: arena.subjectKey,
      arena: arena.title,
      level: selectedDuelLevel,
    });

    const questions = getAdaptiveQuestionsForArena(
      selectedDuelClass,
      selectedDuelLevel,
      arena.subjectKey,
      arena.questionCount || 10
    );

    const room: DuelRoom = {
      roomId: `ARENA-${selectedDuelClass.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: Date.now(),
      mode: 'bot',
      status: 'countdown',
      countdown: 3,
      host: {
        uid: currentPlayerUid,
        displayName: currentDisplayName,
        score: 0,
        currentQIndex: 0,
        isReady: true,
        selectedAnswer: null,
        hasAnsweredCurrent: false,
        streak: 0,
      },
      guest: {
        uid: 'bot_mimi',
        displayName: `Bot Mimi (${arena.title})`,
        score: 0,
        currentQIndex: 0,
        isReady: true,
        selectedAnswer: null,
        hasAnsweredCurrent: false,
        streak: 0,
      },
      questions,
      currentRound: 0,
      totalRounds: questions.length,
      xpStake: arena.xpReward,
    };

    setIsHost(true);
    setActiveDuelRoom(room);
  };

  const startBotDuel = () => {
    if (lastPlayedArena) {
      startAdaptiveArenaDuel(lastPlayedArena);
      return;
    }
    const arenas = getAdaptiveArenasForClass(selectedDuelClass, selectedDuelLevel);
    const defaultArena =
      selectedSubjectFilter !== 'semua'
        ? arenas.find((a) => a.subjectKey === selectedSubjectFilter) || arenas[0]
        : arenas.find((a) => a.subjectKey === 'cerdas_cermat') || arenas[0];
    startAdaptiveArenaDuel(defaultArena);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. PVP ROOM CREATION & JOINING
  // ─────────────────────────────────────────────────────────────────────────────
  const handleCreatePvpRoom = async () => {
    setIsCreatingRoom(true);
    setRoomErrorMessage(null);
    soundService.resumeAudio();
    if (isBgmOn) {
      soundService.startDuelMusic();
    }
    try {
      const randomCode =
        'CYB' + Math.floor(100 + Math.random() * 900).toString();
      const arenaSubj =
        selectedSubjectFilter !== 'semua' ? selectedSubjectFilter : 'cerdas_cermat';
      const questions = getAdaptiveQuestionsForArena(
        selectedDuelClass,
        selectedDuelLevel,
        arenaSubj,
        10
      );
      const room: DuelRoom = {
        roomId: randomCode,
        createdAt: Date.now(),
        mode: 'pvp',
        status: 'waiting',
        countdown: 3,
        host: {
          uid: currentPlayerUid,
          displayName: currentDisplayName,
          score: 0,
          currentQIndex: 0,
          isReady: true,
          selectedAnswer: null,
          hasAnsweredCurrent: false,
          streak: 0,
        },
        guest: null,
        questions,
        currentRound: 0,
        totalRounds: questions.length,
        xpStake: 200,
      };

      await createDuelRoom(room);
      setIsHost(true);
      setActiveDuelRoom(room);
    } catch (err: any) {
      console.error(err);
      setRoomErrorMessage('Gagal membuat room. Coba beberapa saat lagi.');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinPvpRoom = async () => {
    const code = joinRoomInput.trim().toUpperCase();
    if (!code) {
      setRoomErrorMessage('Masukkan kode room terlebih dahulu.');
      return;
    }

    setIsJoiningRoom(true);
    setRoomErrorMessage(null);
    soundService.resumeAudio();
    if (isBgmOn) {
      soundService.startDuelMusic();
    }
    try {
      const guestPlayer: DuelPlayer = {
        uid: currentPlayerUid,
        displayName: currentDisplayName,
        score: 0,
        currentQIndex: 0,
        isReady: true,
        selectedAnswer: null,
        hasAnsweredCurrent: false,
        streak: 0,
      };

      await joinDuelRoom(code, guestPlayer);
      setIsHost(false);
      const fallbackQuestions = getAdaptiveQuestionsForArena(
        selectedDuelClass,
        selectedDuelLevel,
        'cerdas_cermat',
        10
      );
      setActiveDuelRoom({
        roomId: code,
        createdAt: Date.now(),
        mode: 'pvp',
        status: 'countdown',
        countdown: 3,
        host: {
          uid: 'host',
          displayName: 'Teman Mabar',
          score: 0,
          currentQIndex: 0,
          isReady: true,
          selectedAnswer: null,
          hasAnsweredCurrent: false,
          streak: 0,
        },
        guest: guestPlayer,
        questions: fallbackQuestions,
        currentRound: 0,
        totalRounds: fallbackQuestions.length,
        xpStake: 200,
      });
    } catch (err: any) {
      console.error(err);
      setRoomErrorMessage(
        err.message || 'Room tidak ditemukan atau sudah penuh. Periksa kembali kode room.'
      );
    } finally {
      setIsJoiningRoom(false);
    }
  };

  const copyRoomCodeToClipboard = () => {
    if (!activeDuelRoom) return;
    navigator.clipboard.writeText(activeDuelRoom.roomId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Exit duel arena
  const handleExitDuel = () => {
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    if (botSimTimerRef.current) clearTimeout(botSimTimerRef.current);
    if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    soundService.stopDuelMusic();
    setActiveDuelRoom(null);
  };

  const activeClassMeta =
    DUEL_CLASS_OPTIONS.find((c) => c.key === selectedDuelClass) || DUEL_CLASS_OPTIONS[1];
  const activeLevelMeta = DUEL_LEVEL_BADGES[selectedDuelLevel];
  const allArenas = getAdaptiveArenasForClass(selectedDuelClass, selectedDuelLevel);
  const filteredArenas =
    selectedSubjectFilter === 'semua'
      ? allArenas
      : allArenas.filter(
          (a) =>
            a.subjectKey === selectedSubjectFilter ||
            a.subjectKey === 'cerdas_cermat' ||
            a.subjectKey === 'tantang_kakak'
        );

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: 1. COUNTDOWN VIEW (3.. 2.. 1.. GO!)
  // ─────────────────────────────────────────────────────────────────────────────
  if (activeDuelRoom?.status === 'countdown') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="relative">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-sky-500/10 border-2 border-sky-400/50 flex items-center justify-center animate-pulse shadow-[0_0_35px_rgba(56,189,248,0.35)]">
            <span className="text-5xl sm:text-7xl font-mono font-black text-sky-400 tabular-nums">
              {activeDuelRoom.countdown}
            </span>
          </div>
          <div className="absolute -top-3 -right-3 px-2 py-0.5 rounded-full bg-amber-400 text-[10px] font-black text-slate-950 font-mono">
            READY
          </div>
        </div>

        <div className="mt-6 space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Duel Dimulai!
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {activeDuelRoom.host.displayName} vs {activeDuelRoom.guest?.displayName || 'Lawan'}
          </p>
        </div>

        <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0F172A] border border-slate-800 text-[11px] text-sky-300 font-mono">
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>10 Soal Adaptif · Jawab secepat mungkin untuk bonus poin!</span>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleToggleBgm}
            title={isBgmOn ? 'BGM Cyber Aktif (Klik untuk mematikan)' : 'BGM Cyber Mati (Klik untuk menyalakan)'}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              isBgmOn
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 shadow-sm shadow-amber-400/20'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {isBgmOn ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            <span>BGM Pertarungan: {isBgmOn ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: 2. WAITING IN ROOM FOR FRIEND (PVP HOST)
  // ─────────────────────────────────────────────────────────────────────────────
  if (activeDuelRoom?.status === 'waiting') {
    return (
      <div className="max-w-md mx-auto space-y-5 px-3 py-4 text-center">
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0F172A] border border-sky-500/40 shadow-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            MENUNGGU LAWAN BERGABUNG
          </div>

          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-black text-white">
              Kode Room Duel Kamu
            </h2>
            <p className="text-xs text-slate-400">
              Bagikan kode ini kepada temanmu untuk mabar 10 soal adaptif ({activeClassMeta.label} • {activeLevelMeta.label})
            </p>
          </div>

          {/* Big Neon Code Box */}
          <div className="py-4 px-6 rounded-xl bg-[#0B1120] border-2 border-dashed border-sky-400/60 flex items-center justify-center gap-3">
            <span className="text-3xl sm:text-4xl font-mono font-black tracking-widest text-sky-400">
              {activeDuelRoom.roomId}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="button"
              onClick={copyRoomCodeToClipboard}
              className="flex-1 py-2.5 px-4 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              {copiedCode ? (
                <>
                  <Check className="w-4 h-4 text-emerald-800" />
                  <span>Kode Berhasil Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Kode Room</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleExitDuel}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
            >
              Batal
            </button>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0B1120] border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-center gap-2">
          <Bot className="w-4 h-4 text-sky-400 shrink-0" />
          <span>Mau latihan dulu? Kamu juga bisa main solo lawan Cyber Bot Mimi kapan saja.</span>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: 3. IN-PROGRESS ACTIVE DUEL SCREEN (MOBILE ERGONOMIC & HIGH IMPACT)
  // ─────────────────────────────────────────────────────────────────────────────
  if (activeDuelRoom?.status === 'in_progress') {
    const currentQ = activeDuelRoom.questions[activeDuelRoom.currentRound];
    const isPlayerHost = isHost;
    const playerStats = isPlayerHost ? activeDuelRoom.host : activeDuelRoom.guest!;
    const opponentStats = isPlayerHost ? activeDuelRoom.guest : activeDuelRoom.host;

    return (
      <div className="max-w-xl mx-auto space-y-3 sm:space-y-4 pb-6">
        {/* ── Real-Time Split Duel HUD ── */}
        <section className="p-3 sm:p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg space-y-2.5">
          {/* Top Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-sky-400 font-bold">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Soal {activeDuelRoom.currentRound + 1}/{activeDuelRoom.totalRounds}
            </span>

            {/* Countdown Badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono font-extrabold text-xs tabular-nums ${
                questionTimeLeft <= 3
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                  : 'bg-[#0B1120] text-sky-300 border border-slate-800'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>{questionTimeLeft}s</span>
            </div>

            {/* Duel Music & Volume Control */}
            <div className="flex items-center gap-2 bg-[#0B1120] px-2.5 py-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={handleToggleBgm}
                title={isBgmOn ? 'BGM Pertarungan Aktif (Klik untuk matikan)' : 'BGM Pertarungan Mati (Klik untuk nyalakan)'}
                className={`text-[10px] font-bold flex items-center gap-1 cursor-pointer active:scale-95 ${
                  isBgmOn ? 'text-amber-300' : 'text-slate-400'
                }`}
              >
                {isBgmOn ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
                <span>{isBgmOn ? 'BGM ON' : 'MUTE'}</span>
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isBgmOn ? bgmVolume : 0}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                aria-label="Volume Musik Pertarungan"
                className="w-14 sm:w-20 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            <span className="text-[11px] text-slate-400 truncate max-w-[130px] sm:max-w-none">
              {currentQ?.category}
            </span>
          </div>

          {/* Head to Head Split Bar */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 pt-1 border-t border-slate-800/80">
            {/* Player Side */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-400 flex items-center justify-center text-[10px] font-bold text-sky-300 shrink-0">
                  {playerStats.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="truncate text-xs font-bold text-white max-w-[85px] sm:max-w-[120px]">
                  {playerStats.displayName}
                </div>
              </div>
              <div className="text-base sm:text-lg font-black font-mono text-sky-400 tabular-nums">
                {playerStats.score}{' '}
                <span className="text-[10px] text-slate-400 font-normal">PTS</span>
              </div>
            </div>

            {/* VS Emblem */}
            <div className="px-2 py-1 rounded-md bg-[#0B1120] border border-slate-800 text-[10px] font-black font-mono text-amber-400 shrink-0">
              VS
            </div>

            {/* Opponent Side */}
            <div className="space-y-1 text-right">
              <div className="flex items-center justify-end gap-1.5">
                <div className="truncate text-xs font-bold text-slate-300 max-w-[85px] sm:max-w-[120px]">
                  {opponentStats?.displayName || 'Menunggu...'}
                </div>
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-400 flex items-center justify-center text-[10px] font-bold text-indigo-300 shrink-0">
                  {opponentStats?.displayName.charAt(0).toUpperCase() || '?'}
                </div>
              </div>
              <div className="text-base sm:text-lg font-black font-mono text-indigo-400 tabular-nums">
                {opponentStats?.score || 0}{' '}
                <span className="text-[10px] text-slate-400 font-normal">PTS</span>
              </div>
            </div>
          </div>

          {/* Synchronous Dynamic Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden flex">
            <div
              className="h-full bg-sky-400 transition-all duration-300"
              style={{
                width: `${Math.min(
                  100,
                  (playerStats.score / (playerStats.score + (opponentStats?.score || 1))) * 100
                )}%`,
              }}
            />
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{
                width: `${Math.min(
                  100,
                  ((opponentStats?.score || 0) /
                    (playerStats.score + (opponentStats?.score || 1))) *
                    100
                )}%`,
              }}
            />
          </div>
        </section>

        {/* ── Question Card (Aesthetic, Compact, Zero Bloat) ── */}
        <section className="p-4 sm:p-5 rounded-2xl bg-[#0F172A] border border-sky-500/30 shadow-xl space-y-3.5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-400/10 text-sky-300 text-[10px] font-mono font-bold">
                <ShieldCheck className="w-3 h-3 text-sky-400" />
                <span>SOAL #{activeDuelRoom.currentRound + 1} · {currentQ?.category}</span>
              </div>
              <span className="text-[10px] font-mono text-amber-300">
                {activeLevelMeta.emoji} Level {activeLevelMeta.label}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white leading-snug">
              {currentQ.question}
            </h2>
          </div>

          {/* 4 Interactive Touch Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 pt-1">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedAnswerIndex === idx;
              const isCorrectAnswer = idx === currentQ.correctIndex;

              let buttonStyle =
                'bg-[#0B1120] hover:bg-slate-800/80 border-slate-800 text-slate-100 hover:border-sky-400/60';

              if (isAnswerLocked) {
                if (isCorrectAnswer) {
                  buttonStyle =
                    'bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.25)]';
                } else if (isSelected && !isCorrectAnswer) {
                  buttonStyle =
                    'bg-rose-500/20 border-rose-500 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.25)]';
                } else {
                  buttonStyle = 'bg-[#0B1120]/60 border-slate-900 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={`duel-opt-${activeDuelRoom.currentRound}-${idx}`}
                  type="button"
                  disabled={isAnswerLocked}
                  onClick={() => handleSelectAnswer(idx)}
                  className={`min-h-[46px] p-2.5 sm:p-3 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-2.5 active:scale-[0.98] ${buttonStyle}`}
                >
                  <span className="leading-snug">{opt}</span>
                  <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700/80 flex items-center justify-center text-[10px] font-mono text-slate-400 shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Explanation Snippet */}
          {showExplanation && (
            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-400/30 text-xs text-sky-200 space-y-1 animate-fadeIn">
              <div className="font-bold flex items-center gap-1.5 text-sky-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Kunci Konsep Mimi:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                {currentQ.explanation}
              </p>
            </div>
          )}
        </section>

        {/* Exit match shortcut */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleExitDuel}
            className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            Keluar dari Duel
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: 4. FINISHED / PODIUM SCREEN (WITH VICTORY FANFARE!)
  // ─────────────────────────────────────────────────────────────────────────────
  if (activeDuelRoom?.status === 'finished') {
    const isPlayerHost = isHost;
    const playerStats = isPlayerHost ? activeDuelRoom.host : activeDuelRoom.guest!;
    const opponentStats = isPlayerHost ? activeDuelRoom.guest : activeDuelRoom.host;
    const won = activeDuelRoom.winnerUid === currentPlayerUid;
    const isDraw = !activeDuelRoom.winnerUid;

    return (
      <div className="max-w-md mx-auto space-y-4 px-3 py-4 text-center">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0F172A] border border-sky-500/40 shadow-2xl space-y-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mx-auto bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.3)]">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-slate-950" />
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
              {won ? '🏆 DUEL CHAMPION · VICTORY FANFARE' : isDraw ? 'HASIL SEIMBANG' : 'MATCH SELESAI'}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {won
                ? 'Kemenangan Gemilang!'
                : isDraw
                ? 'Pertandingan Sangat Sengit!'
                : 'Tetap Semangat & Coba Lagi!'}
            </h2>
            <p className="text-xs text-slate-400">
              {won
                ? `Kamu berhasil mengungguli ${opponentStats?.displayName || 'lawan'} di ${activeClassMeta.label}`
                : `Refleks yang luar biasa dalam menjawab tantangan 10 soal adaptif`}
            </p>
          </div>

          {/* Scores Overview Pill */}
          <div className="py-3 px-4 rounded-xl bg-[#0B1120] border border-slate-800 grid grid-cols-2 gap-2 text-center">
            <div>
              <div className="text-[10px] text-slate-400">Skor Kamu</div>
              <div className="text-xl font-mono font-black text-sky-400 tabular-nums">
                {playerStats.score}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">
                Skor {opponentStats?.displayName.split(' ')[0] || 'Lawan'}
              </div>
              <div className="text-xl font-mono font-black text-indigo-400 tabular-nums">
                {opponentStats?.score || 0}
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              +{won ? activeDuelRoom.xpStake : Math.round(activeDuelRoom.xpStake * 0.4)} XP Telah
              Ditambahkan!
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                soundService.playVictoryMusic();
                startBotDuel();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Main Lagi (10 Soal Baru)</span>
            </button>
            <button
              type="button"
              onClick={handleExitDuel}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors cursor-pointer"
            >
              Pilih Arena Lain
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: 5. MAIN LOBBY (ADAPTIVE DUEL ARENA BY CLASS, LEVEL & 8 SUBJECT ARENAS)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 sm:space-y-5 pb-12 sm:pb-8">
      {/* ── Dynamic Adaptive Header ── */}
      <section className="p-4 sm:p-6 rounded-2xl bg-[#0F172A] border border-slate-800/90 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-400/15 border border-sky-400/30 text-sky-300 text-[11px] font-mono font-bold">
            <Swords className="w-3.5 h-3.5 text-sky-400" />
            <span>ARENA DUEL ADAPTIF · 5.000+ BANK SOAL</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight flex flex-wrap items-center gap-2">
            <span>Duel Arena — {activeClassMeta.label}</span>
            <span className="text-sky-400">•</span>
            <span className="inline-flex items-center gap-1 text-amber-300">
              <span>{activeLevelMeta.emoji} Level {activeLevelMeta.label}</span>
              <span>🏆</span>
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
            Soal otomatis menyesuaikan kelas & level kemampuanmu! Tersedia Matematika, Bahasa Inggris, PKN, IPA, IPS, Bahasa Indonesia, Cerdas Cermat Campur, hingga Tantang Kakak Kelas.
          </p>
        </div>

        {/* Win/Loss Pill, BGM Cyber Toggle & Global Leaderboard */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleToggleBgm}
            title={isBgmOn ? 'BGM Cyber Duel Aktif (Klik untuk matikan)' : 'BGM Cyber Duel Mati (Klik untuk nyalakan)'}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0 ${
              isBgmOn
                ? 'bg-amber-400/15 text-amber-300 border-amber-400/40 shadow-sm shadow-amber-400/10'
                : 'bg-[#0B1120] text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {isBgmOn ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            <span>BGM Duel: {isBgmOn ? 'ON' : 'OFF'}</span>
          </button>

          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#0B1120] border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400">Rekor Menang</div>
              <div className="text-sm sm:text-base font-extrabold font-mono text-emerald-400 tabular-nums">
                {uiState.rivalWins}W / {uiState.rivalMatches}L
              </div>
            </div>
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
          </div>

          {onOpenLeaderboard && (
            <button
              type="button"
              onClick={onOpenLeaderboard}
              className="px-3.5 py-2.5 rounded-xl bg-sky-400/15 hover:bg-sky-400/25 border border-sky-400/30 text-sky-300 font-bold text-xs transition-colors shrink-0 cursor-pointer"
            >
              Papan Peringkat
            </button>
          )}
        </div>
      </section>

      {/* ── Adaptive Class & Level Selector Bar ── */}
      <section className="p-4 sm:p-5 rounded-2xl bg-[#0F172A] border border-sky-500/30 shadow-md space-y-3.5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {/* 1. Pilih Kelas Siswa */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-300 flex items-center justify-between">
              <span>1. Pilih Kelas / Kategori Peserta:</span>
              <span className="text-slate-400 font-normal">Target: {activeClassMeta.nextClassLabel}</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {DUEL_CLASS_OPTIONS.map((cls) => {
                const active = selectedDuelClass === cls.key;
                return (
                  <button
                    key={cls.key}
                    type="button"
                    onClick={() => setSelectedDuelClass(cls.key)}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer active:scale-95 text-center ${
                      active
                        ? 'bg-sky-400 text-slate-950 border-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                        : 'bg-[#0B1120] text-slate-300 border-slate-800 hover:border-sky-500/40'
                    }`}
                  >
                    <div className="truncate">{cls.shortLabel}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Pilih Level Kesulitan */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center justify-between">
              <span>2. Pilih Level Kesulitan Arena:</span>
              <span className="text-slate-400 font-normal">{activeLevelMeta.stars}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(['pemula', 'menengah', 'mahir', 'ahli'] as DuelDifficultyLevel[]).map((lvl) => {
                const meta = DUEL_LEVEL_BADGES[lvl];
                const active = selectedDuelLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedDuelLevel(lvl)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 ${
                      active
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                        : 'bg-[#0B1120] text-slate-300 border-slate-800 hover:border-amber-400/40'
                    }`}
                  >
                    <span>{meta.emoji}</span>
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Filter Mapel */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-400 mr-1">Filter Mapel:</span>
            {[
              { key: 'semua', label: 'Semua Arena (8)' },
              { key: 'mtk', label: '🔢 MTK' },
              { key: 'inggris', label: '🇬🇧 Inggris' },
              { key: 'pkn', label: '🏛️ PKN' },
              { key: 'ipa', label: '🧬 IPA' },
              { key: 'ips', label: '📜 IPS' },
              { key: 'indo', label: '📝 Indo' },
            ].map((item) => {
              const active = selectedSubjectFilter === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSelectedSubjectFilter(item.key as DuelSubjectFilter)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-sky-400/20 text-sky-300 border border-sky-400/50'
                      : 'bg-[#0B1120] text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Volume Slider Bar */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B1120] border border-slate-800">
            <Music className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] text-slate-300 font-mono">Volume Musik Duel:</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isBgmOn ? bgmVolume : 0}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              aria-label="Kontrol Volume Musik Latar Duel"
              className="w-20 sm:w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <span className="text-[10px] font-mono text-amber-300 w-8 text-right">
              {isBgmOn ? `${Math.round(bgmVolume * 100)}%` : 'OFF'}
            </span>
          </div>
        </div>
      </section>

      {/* ── Arena Mode Switcher Tabs (Ergonomic for Touch) ── */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#0B1120] border border-slate-800">
        <button
          type="button"
          onClick={() => setArenaTab('bot')}
          className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            arenaTab === 'bot'
              ? 'bg-sky-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bot className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Pilih Arena Duel (8)</span>
        </button>

        <button
          type="button"
          onClick={() => setArenaTab('pvp')}
          className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            arenaTab === 'pvp'
              ? 'bg-sky-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Mabar Teman (PvP)</span>
        </button>

        <button
          type="button"
          onClick={() => setArenaTab('rivals')}
          className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            arenaTab === 'rivals'
              ? 'bg-sky-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Rival Sekolah</span>
        </button>
      </div>

      {/* ── TAB 1: 8 ADAPTIVE ARENA CARDS (MTK, INGGRIS, PKN, IPA, IPS, INDO, CERDAS CERMAT, TANTANG KAKAK KELAS) ── */}
      {arenaTab === 'bot' && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div>
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
                <span>PILIH ARENA SESUAI KELASMU ({activeClassMeta.label})</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-400/30">
                  {activeLevelMeta.emoji} {activeLevelMeta.label}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Klik salah satu kartu arena di bawah untuk langsung bertanding 10 soal anti-bosan melawan Cyber Bot Mimi!
              </p>
            </div>
          </div>

          {/* Grid 8 Kartu Arena */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredArenas.map((arena) => {
              return (
                <div
                  key={arena.id}
                  onClick={() => startAdaptiveArenaDuel(arena)}
                  className="group relative p-4 rounded-2xl bg-[#0F172A] hover:bg-slate-900 border border-slate-800 hover:border-sky-400/60 transition-all shadow-lg flex flex-col justify-between gap-3 cursor-pointer active:scale-[0.99]"
                >
                  <div className="space-y-2">
                    {/* Top Row: Icon + Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                        {arena.icon}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                            arena.isDoubleXp
                              ? 'bg-amber-400/20 border-amber-400/50 text-amber-300'
                              : activeLevelMeta.colorClass
                          }`}
                        >
                          {arena.badgeText}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#0B1120] border border-slate-800 text-[10px] font-mono text-slate-300">
                          {activeLevelMeta.stars}
                        </span>
                      </div>
                    </div>

                    {/* Arena Title & Subtitle */}
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-white group-hover:text-sky-300 transition-colors">
                        {arena.title}
                      </h3>
                      <p className="text-xs font-semibold text-sky-400 leading-snug mt-0.5">
                        {arena.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Footer Info */}
                  <div className="pt-2.5 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>📋 {arena.questionCount} Soal</span>
                      <span className="text-amber-400 font-bold">
                        +{arena.xpReward} XP
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        startAdaptiveArenaDuel(arena);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <Swords className="w-3.5 h-3.5" />
                      <span>Mulai Duel Arena</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── TAB 2: DUEL LAWAN TEMAN (REAL-TIME PVP) ── */}
      {arenaTab === 'pvp' && (
        <section className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Box Buat Room */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0F172A] border border-slate-800 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/40 flex items-center justify-center text-sky-400">
                  <Share2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Buat Room Duel Baru ({activeClassMeta.shortLabel} • {activeLevelMeta.label})
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dapatkan kode room 5-karakter lalu bagikan ke temanmu untuk langsung mabar 10 soal adaptif.
                </p>
              </div>

              <button
                type="button"
                disabled={isCreatingRoom}
                onClick={handleCreatePvpRoom}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isCreatingRoom ? (
                  <span>Membuat Room...</span>
                ) : (
                  <>
                    <Swords className="w-4 h-4" />
                    <span>Buat Room Duel (+200 XP)</span>
                  </>
                )}
              </button>
            </div>

            {/* Box Gabung Room */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0F172A] border border-slate-800 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Gabung Room Teman
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sudah punya kode room dari teman? Masukkan kode di bawah untuk langsung terhubung.
                </p>

                <input
                  type="text"
                  maxLength={10}
                  value={joinRoomInput}
                  onChange={(e) => setJoinRoomInput(e.target.value.toUpperCase())}
                  placeholder="Contoh: CYB921"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B1120] border border-slate-800 focus:border-sky-400 text-white font-mono text-sm uppercase placeholder:normal-case placeholder:text-slate-600 focus:outline-none transition-colors"
                />
              </div>

              <button
                type="button"
                disabled={isJoiningRoom || !joinRoomInput.trim()}
                onClick={handleJoinPvpRoom}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isJoiningRoom ? (
                  <span>Menghubungkan...</span>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    <span>Masuk Arena Duel</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {roomErrorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {roomErrorMessage}
            </div>
          )}
        </section>
      )}

      {/* ── TAB 3: DAFTAR RIVAL LATIHAN (NPC SEKOLAH) ── */}
      {arenaTab === 'rivals' && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {uiState.rivals.map((rival, idx) => (
            <div
              key={`rival-${rival.id}-${idx}`}
              className="p-4 sm:p-5 rounded-2xl bg-[#0F172A] border border-slate-800/90 flex flex-col justify-between gap-3.5"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-[11px]">
                    {rival.educationLevel} · {rival.difficulty}
                  </span>
                  <span className="font-mono text-amber-400 font-bold tabular-nums">
                    +{rival.xpStake} XP
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{rival.name}</h3>
                  <p className="text-[11px] text-slate-400">
                    {rival.title} · {rival.school}
                  </p>
                </div>

                <p className="text-xs text-slate-300 leading-snug">
                  Keahlian: {rival.specialty}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 tabular-nums">
                  <span>Rating: {rival.xp} XP</span>
                  <span>Win Rate: {rival.winRate}%</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundService.resumeAudio();
                    if (isBgmOn) {
                      soundService.startDuelMusic();
                    }
                    const questions = getAdaptiveQuestionsForArena(
                      selectedDuelClass,
                      selectedDuelLevel,
                      'cerdas_cermat',
                      10
                    );
                    const room: DuelRoom = {
                      roomId: 'RIVAL-' + rival.id,
                      createdAt: Date.now(),
                      mode: 'bot',
                      status: 'countdown',
                      countdown: 3,
                      host: {
                        uid: currentPlayerUid,
                        displayName: currentDisplayName,
                        score: 0,
                        currentQIndex: 0,
                        isReady: true,
                        selectedAnswer: null,
                        hasAnsweredCurrent: false,
                        streak: 0,
                      },
                      guest: {
                        uid: rival.id,
                        displayName: rival.name,
                        score: 0,
                        currentQIndex: 0,
                        isReady: true,
                        selectedAnswer: null,
                        hasAnsweredCurrent: false,
                        streak: 0,
                      },
                      questions,
                      currentRound: 0,
                      totalRounds: questions.length,
                      xpStake: rival.xpStake,
                    };
                    setIsHost(true);
                    setActiveDuelRoom(room);
                  }}
                  className="w-full py-2 px-3 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Tantang {rival.name.split(' ')[0]} (10 Soal)</span>
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};
