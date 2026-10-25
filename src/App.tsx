/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AuthUser,
  BadgeItem,
  BottomNavTab,
  ChatMessage,
  EducationLevel,
  LeaderboardEntry,
  LearningMilestone,
  LevelItem,
  MimiUiState,
  QuizQuestion,
  RivalProfile,
  StudyProgress,
} from './types/mimi';
import {
  CLASSES_BY_LEVEL,
  INITIAL_BADGES,
  INITIAL_LEVELS,
  INITIAL_MILESTONES,
  INITIAL_QUIZ_QUESTIONS,
  INITIAL_RIVALS,
  calculateCyberRank,
  calculateLevelFromXp,
  getSuggestedPromptsForLevel,
} from './data/curriculumData';
import { SignInScreen } from './components/SignInScreen';
import {
  CyberBottomBar,
  CyberNavigationRail,
  MimiFloatingDockWidget,
  WebTopBar,
} from './components/Navigation';
import { ShareAndDownloadHubDialog } from './components/ShareAndDownloadHubDialog';
import {
  MimiChatBottomSheet,
  MimiDesktopFloatingChatWindow,
} from './components/MimiChat';
import { HomeScreen } from './components/screens/HomeScreen';
import { TantanganScreen } from './components/screens/TantanganScreen';
import { PeringkatScreen } from './components/screens/PeringkatScreen';
import { KuisScreen } from './components/screens/KuisScreen';
import { LencanaScreen } from './components/screens/LencanaScreen';
import { ProfilScreen } from './components/screens/ProfilScreen';

const TOKEN_STORAGE_KEY = 'mimi15_session_token';

function formatShortTime(): string {
  return new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function App() {
  // ==========================================================================
  // 1. AUTHENTICATION STATE (RootAppNavigation equivalent)
  // ==========================================================================
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY)
  );
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  // ==========================================================================
  // 2. MIMI VIEWMODEL STATE
  // ==========================================================================
  const [currentTab, setCurrentTab] = useState<BottomNavTab>(BottomNavTab.BERANDA);
  const [selectedEducationLevel, setSelectedEducationLevel] = useState<EducationLevel>(
    EducationLevel.SMP
  );
  const [selectedClass, setSelectedClass] = useState<string>('Kelas 8');
  const [xp, setXp] = useState<number>(120);
  const [streakDays, setStreakDays] = useState<number>(3);
  const [rivalWins, setRivalWins] = useState<number>(0);
  const [rivalMatches, setRivalMatches] = useState<number>(0);
  const [mimiDialogCount, setMimiDialogCount] = useState<number>(0);

  const [studyProgress, setStudyProgress] = useState<StudyProgress>({
    completedLevelIds: [],
    totalModulesCompleted: 0,
    totalQuizzesTaken: 0,
    correctQuizAnswers: 0,
    totalQuizQuestions: 0,
    studyMinutes: 25,
    lastStudiedTopic: 'Orientasi Ekosistem Mimi 15',
    lastUpdated: 'Baru saja',
  });

  const [milestones, setMilestones] = useState<LearningMilestone[]>(INITIAL_MILESTONES);

  // Chat & Dock states
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isChatDocked, setIsChatDocked] = useState<boolean>(false);
  const [isMimiTyping, setIsMimiTyping] = useState<boolean>(false);
  const [latestXpNotification, setLatestXpNotification] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-mimi',
      sender: 'mimi',
      text: 'Halo! Selamat datang di Room Belajar. Aku Mimi V15 — aku bisa jadi teman ngobrol, asisten, guru, sekaligus profesormu. Kalau mau ngobrol santai atau tanya hal umum, langsung cerita saja ya! Kalau ada soal pelajaran yang bikin bingung, kirim ke sini nanti aku bantu kasih kisi-kisi dan tuntun langkahnya sampai kamu paham sendiri.',
      timestamp: formatShortTime(),
    },
  ]);

  // Active Lesson Modal
  const [activeLevelModal, setActiveLevelModal] = useState<LevelItem | null>(null);

  // Share & Download Hub Dialog
  const [isShareHubOpen, setIsShareHubOpen] = useState<boolean>(false);

  // Quiz state
  const [customAiQuizzes, setCustomAiQuizzes] = useState<QuizQuestion[] | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [isQuizFinished, setIsQuizFinished] = useState<boolean>(false);
  const [isGeneratingAiQuiz, setIsGeneratingAiQuiz] = useState<boolean>(false);

  // Global Leaderboard state
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState<boolean>(false);
  const [leaderboardUpdatedAt, setLeaderboardUpdatedAt] = useState<string>(formatShortTime());

  // Responsive viewport detection (Desktop >= 768px vs Mobile < 768px)
  const [isWideScreen, setIsWideScreen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );

  useEffect(() => {
    const handleResize = () => setIsWideScreen(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ==========================================================================
  // 3. HYDRATE USER DATA HELPER
  // ==========================================================================
  const applyServerUserData = useCallback((userData: Record<string, any> | null) => {
    if (!userData) return;
    if (typeof userData.xp === 'number') setXp(userData.xp);
    if (typeof userData.streakDays === 'number') setStreakDays(userData.streakDays);
    if (
      userData.selectedEducationLevel &&
      Object.values(EducationLevel).includes(userData.selectedEducationLevel)
    ) {
      setSelectedEducationLevel(userData.selectedEducationLevel as EducationLevel);
    }
    if (userData.selectedClass) {
      setSelectedClass(String(userData.selectedClass));
    }
    if (typeof userData.rivalWins === 'number') setRivalWins(userData.rivalWins);
    if (typeof userData.rivalMatches === 'number') setRivalMatches(userData.rivalMatches);
    if (Array.isArray(userData.milestones) && userData.milestones.length > 0) {
      setMilestones(userData.milestones);
    }
    setStudyProgress((prev) => ({
      ...prev,
      completedLevelIds: Array.isArray(userData.completedLevelIds)
        ? userData.completedLevelIds
        : prev.completedLevelIds,
      totalModulesCompleted: Array.isArray(userData.completedLevelIds)
        ? userData.completedLevelIds.length
        : prev.totalModulesCompleted,
      totalQuizzesTaken:
        typeof userData.totalQuizzesTaken === 'number'
          ? userData.totalQuizzesTaken
          : prev.totalQuizzesTaken,
      correctQuizAnswers:
        typeof userData.correctQuizAnswers === 'number'
          ? userData.correctQuizAnswers
          : prev.correctQuizAnswers,
      totalQuizQuestions:
        typeof userData.totalQuizQuestions === 'number'
          ? userData.totalQuizQuestions
          : prev.totalQuizQuestions,
      studyMinutes:
        typeof userData.studyMinutes === 'number'
          ? userData.studyMinutes
          : prev.studyMinutes,
      lastStudiedTopic: userData.lastStudiedTopic || prev.lastStudiedTopic,
      lastUpdated: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));
  }, []);

  // Verify existing session on startup
  useEffect(() => {
    async function verifySession() {
      if (!sessionToken) {
        setIsAuthChecking(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${sessionToken}` },
        });
        if (!res.ok) {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          setSessionToken(null);
          setAuthUser(null);
        } else {
          const data = await res.json();
          setAuthUser(data.user);
          applyServerUserData(data.userData);
        }
      } catch {
        // Keep offline session graceful
      } finally {
        setIsAuthChecking(false);
      }
    }
    verifySession();
  }, [sessionToken, applyServerUserData]);

  // Sync progress to server whenever key metrics change
  useEffect(() => {
    if (!authUser || !sessionToken) return;
    const timeout = setTimeout(() => {
      fetch('/api/user/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          userData: {
            xp,
            streakDays,
            selectedEducationLevel,
            selectedClass,
            completedLevelIds: studyProgress.completedLevelIds,
            totalQuizzesTaken: studyProgress.totalQuizzesTaken,
            correctQuizAnswers: studyProgress.correctQuizAnswers,
            totalQuizQuestions: studyProgress.totalQuizQuestions,
            studyMinutes: studyProgress.studyMinutes,
            lastStudiedTopic: studyProgress.lastStudiedTopic,
            rivalWins,
            rivalMatches,
            milestones,
          },
        }),
      }).catch(() => {});
    }, 400);
    return () => clearTimeout(timeout);
  }, [
    authUser,
    sessionToken,
    xp,
    streakDays,
    selectedEducationLevel,
    selectedClass,
    studyProgress,
    rivalWins,
    rivalMatches,
    milestones,
  ]);

  const fetchLeaderboard = useCallback(async () => {
    if (!sessionToken) return;
    setIsLeaderboardLoading(true);
    try {
      const res = await fetch('/api/leaderboard', {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.leaderboard)) {
          setLeaderboard(data.leaderboard);
        }
        if (data.updatedAt) {
          setLeaderboardUpdatedAt(data.updatedAt);
        }
      }
    } catch {
      // Keep existing leaderboard state if offline
    } finally {
      setIsLeaderboardLoading(false);
    }
  }, [sessionToken]);

  useEffect(() => {
    if (authUser && sessionToken) {
      fetchLeaderboard();
    }
  }, [authUser, sessionToken, currentTab, fetchLeaderboard]);

  // ==========================================================================
  // 4. AUTHENTICATION HANDLERS
  // ==========================================================================
  const handleLoginEmail = async (email: string, password: string) => {
    setIsSigningIn(true);
    setSignInError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSignInError(data.error || 'Gagal masuk. Periksa kembali email dan kata sandi.');
        return;
      }
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      setSessionToken(data.token);
      setAuthUser(data.user);
      applyServerUserData(data.userData);
    } catch {
      setSignInError('Gagal terhubung ke server autentikasi.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleRegisterEmail = async (
    displayName: string,
    email: string,
    password: string,
    securityPin?: string
  ) => {
    setIsSigningIn(true);
    setSignInError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, email, password, securityPin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSignInError(data.error || 'Gagal mendaftarkan akun baru.');
        return;
      }
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      setSessionToken(data.token);
      setAuthUser(data.user);
      applyServerUserData(data.userData);
    } catch {
      setSignInError('Gagal menghubungi server pendaftaran.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleQuickSignIn = async (displayName?: string, email?: string) => {
    setIsSigningIn(true);
    setSignInError(null);
    try {
      const res = await fetch('/api/auth/google-quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSignInError(data.error || 'Gagal masuk cepat.');
        return;
      }
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      setSessionToken(data.token);
      setAuthUser(data.user);
      applyServerUserData(data.userData);
    } catch {
      setSignInError('Gagal memulai sesi masuk cepat.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    if (sessionToken) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionToken}` },
      }).catch(() => {});
    }
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setSessionToken(null);
    setAuthUser(null);
    setCurrentTab(BottomNavTab.BERANDA);
  };

  const handleUpdateProfileSecurity = async (
    displayName: string,
    newPassword?: string,
    securityPin?: string
  ): Promise<string | null> => {
    if (!sessionToken) return 'Sesi tidak valid.';
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ displayName, newPassword, securityPin }),
      });
      const data = await res.json();
      if (!res.ok) return data.error || 'Gagal memperbarui profil.';
      setAuthUser(data.user);
      return null;
    } catch {
      return 'Gagal menghubungi server.';
    }
  };

  // ==========================================================================
  // 5. DERIVED CURRICULUM, QUIZ, AND BADGE STATE
  // ==========================================================================
  const triggerXpToast = (label: string) => {
    setLatestXpNotification(label);
    setTimeout(() => {
      setLatestXpNotification((prev) => (prev === label ? null : prev));
    }, 4000);
  };

  const handleSelectEducationLevel = (lvl: EducationLevel) => {
    setSelectedEducationLevel(lvl);
    const defaultCls = CLASSES_BY_LEVEL[lvl]?.[0] || 'Kelas 7';
    setSelectedClass(defaultCls);
    setCustomAiQuizzes(null);
    setCurrentQuizIndex(0);
    setSelectedQuizAnswer(null);
    setQuizScore(0);
    setIsQuizFinished(false);
  };

  const handleSelectClass = (cls: string) => {
    setSelectedClass(cls);
  };

  const currentLevels = useMemo(() => {
    return INITIAL_LEVELS.filter((l) => l.educationLevel === selectedEducationLevel).map(
      (l) => ({
        ...l,
        isCompleted: studyProgress.completedLevelIds.includes(l.id),
      })
    );
  }, [selectedEducationLevel, studyProgress.completedLevelIds]);

  const activeQuizPool = useMemo(() => {
    if (customAiQuizzes && customAiQuizzes.length > 0) return customAiQuizzes;
    return INITIAL_QUIZ_QUESTIONS.filter(
      (q) => q.educationLevel === selectedEducationLevel
    );
  }, [customAiQuizzes, selectedEducationLevel]);

  const computedBadges: BadgeItem[] = useMemo(() => {
    return INITIAL_BADGES.map((b) => {
      if (b.id === 'badge-module-master') {
        const prog = studyProgress.completedLevelIds.length;
        return { ...b, progress: prog, isUnlocked: prog >= b.maxProgress };
      }
      if (b.id === 'badge-quiz-sharpshooter') {
        const prog = studyProgress.correctQuizAnswers;
        return { ...b, progress: prog, isUnlocked: prog >= b.maxProgress };
      }
      if (b.id === 'badge-mimi-dialog') {
        return {
          ...b,
          progress: mimiDialogCount,
          isUnlocked: mimiDialogCount >= b.maxProgress,
        };
      }
      if (b.id === 'badge-arena-champion') {
        return { ...b, progress: rivalWins, isUnlocked: rivalWins >= b.maxProgress };
      }
      if (b.id === 'badge-milestone-architect') {
        const prog = milestones.length;
        return { ...b, progress: prog, isUnlocked: prog >= b.maxProgress };
      }
      return b;
    });
  }, [
    studyProgress.completedLevelIds.length,
    studyProgress.correctQuizAnswers,
    mimiDialogCount,
    rivalWins,
    milestones.length,
  ]);

  // ==========================================================================
  // 6. INTERACTION HANDLERS (MODULES, MILESTONES, QUIZ, ARENA, MIMI CHAT)
  // ==========================================================================
  const handleCompleteLevel = (levelItem: LevelItem) => {
    const alreadyDone = studyProgress.completedLevelIds.includes(levelItem.id);
    const reward = alreadyDone ? Math.round(levelItem.xpReward * 0.4) : levelItem.xpReward;
    setXp((prev) => prev + reward);
    setStudyProgress((prev) => {
      const nextIds = alreadyDone
        ? prev.completedLevelIds
        : [...prev.completedLevelIds, levelItem.id];
      return {
        ...prev,
        completedLevelIds: nextIds,
        totalModulesCompleted: nextIds.length,
        studyMinutes: prev.studyMinutes + levelItem.estimatedMinutes,
        lastStudiedTopic: levelItem.title,
        lastUpdated: formatShortTime(),
      };
    });
    setActiveLevelModal(null);
    triggerXpToast(`Modul "${levelItem.title}" tuntas! (+${reward} XP)`);
  };

  const handleAddMilestone = (title: string, xpGain: number) => {
    const newMs: LearningMilestone = {
      id: 'ms_' + Date.now(),
      title,
      xpGain,
      createdAt: formatShortTime(),
      completed: true,
      category: `${selectedEducationLevel} · ${selectedClass}`,
    };
    setMilestones((prev) => [newMs, ...prev]);
    setXp((prev) => prev + xpGain);
    triggerXpToast(`Target mandiri dicatat (+${xpGain} XP)`);
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAnswerQuiz = (optionIndex: number) => {
    if (selectedQuizAnswer !== null) return;
    setSelectedQuizAnswer(optionIndex);
    const currentQ = activeQuizPool[currentQuizIndex];
    if (!currentQ) return;

    const isCorrect = optionIndex === currentQ.correctIndex;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      setXp((prev) => prev + currentQ.xpReward);
      triggerXpToast(`Jawaban kuis tepat! (+${currentQ.xpReward} XP)`);
    }

    setStudyProgress((prev) => ({
      ...prev,
      correctQuizAnswers: prev.correctQuizAnswers + (isCorrect ? 1 : 0),
      totalQuizQuestions: prev.totalQuizQuestions + 1,
      lastStudiedTopic: `Kuis ${currentQ.subject}`,
      lastUpdated: formatShortTime(),
    }));
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizIndex + 1 < activeQuizPool.length) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedQuizAnswer(null);
    } else {
      setIsQuizFinished(true);
      setStudyProgress((prev) => ({
        ...prev,
        totalQuizzesTaken: prev.totalQuizzesTaken + 1,
      }));
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedQuizAnswer(null);
    setQuizScore(0);
    setIsQuizFinished(false);
  };

  const handleGenerateAiQuiz = async (customTopic?: string) => {
    setIsGeneratingAiQuiz(true);
    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          educationLevel: selectedEducationLevel,
          selectedClass,
          topic: customTopic,
        }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.questions) && data.questions.length > 0) {
        const formatted: QuizQuestion[] = data.questions.map(
          (q: any, index: number) => ({
            id: `ai-q-${Date.now()}-${index}`,
            educationLevel: selectedEducationLevel,
            classLabel: selectedClass,
            subject: String(q.subject || 'Evaluasi AI'),
            question: String(q.question || ''),
            options: Array.isArray(q.options) ? q.options.slice(0, 4) : [],
            correctIndex: Number(q.correctIndex) || 0,
            explanation: String(q.explanation || ''),
            xpReward: 45,
          })
        );
        setCustomAiQuizzes(formatted);
        setCurrentQuizIndex(0);
        setSelectedQuizAnswer(null);
        setQuizScore(0);
        setIsQuizFinished(false);
      }
    } catch {
      // Keep fallback pool if offline
    } finally {
      setIsGeneratingAiQuiz(false);
    }
  };

  const handleChallengeRival = (
    rival: RivalProfile,
    won: boolean,
    xpEarned: number
  ) => {
    setXp((prev) => prev + xpEarned);
    setRivalMatches((prev) => prev + 1);
    if (won) setRivalWins((prev) => prev + 1);
    setStudyProgress((prev) => ({
      ...prev,
      lastStudiedTopic: `Duel Arena vs ${rival.name}`,
      lastUpdated: formatShortTime(),
    }));
    triggerXpToast(`Duel Arena selesai! (+${xpEarned} XP)`);
  };

  const handleSendMessageToMimi = async (text: string) => {
    const userMsg: ChatMessage = {
      id: 'msg_u_' + Date.now(),
      sender: 'user',
      text,
      timestamp: formatShortTime(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsMimiTyping(true);
    setMimiDialogCount((prev) => prev + 1);

    try {
      const res = await fetch('/api/mimi/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          educationLevel: selectedEducationLevel,
          selectedClass,
          studentName: authUser?.displayName || 'Teman Belajar',
          history: chatMessages.slice(-8),
        }),
      });
      const data = await res.json();
      const replyText =
        res.ok && data.reply
          ? data.reply
          : 'Aku tetap di sini menemanimu di Room Belajar! Coba kirimkan ulang pertanyaanmu atau tulis bagian soal mana yang ingin kita bahas pakai kisi-kisi ya.';
      const xpGain = res.ok ? Number(data.xpAwarded) || 15 : 15;

      const mimiMsg: ChatMessage = {
        id: 'msg_m_' + Date.now(),
        sender: 'mimi',
        text: replyText,
        timestamp: formatShortTime(),
        xpEarned: xpGain > 0 ? xpGain : undefined,
      };
      setChatMessages((prev) => [...prev, mimiMsg]);
      if (xpGain > 0) {
        setXp((prev) => prev + xpGain);
        triggerXpToast(`Diskusi bersama Tutor Mimi! (+${xpGain} XP)`);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: 'msg_err_' + Date.now(),
          sender: 'mimi',
          text: 'Koneksi ke server Tutor Mimi sedang terputus. Pastikan koneksi aktif lalu kirim ulang pertanyaanmu ya!',
          timestamp: formatShortTime(),
        },
      ]);
    } finally {
      setIsMimiTyping(false);
    }
  };

  const handleAskMimiTopic = (promptText: string) => {
    setIsChatOpen(true);
    handleSendMessageToMimi(promptText);
  };

  // ==========================================================================
  // 7. ASSEMBLE UI STATE OBJECT
  // ==========================================================================
  const uiState: MimiUiState = {
    currentTab,
    selectedEducationLevel,
    selectedClass,
    studentName: authUser?.displayName || 'Teman Belajar',
    studentEmail: authUser?.email || '',
    xp,
    level: calculateLevelFromXp(xp),
    streakDays,
    cyberRank: calculateCyberRank(xp),
    isChatOpen,
    isMimiTyping,
    chatMessages,
    latestXpNotification,
    currentLevels,
    activeLevelModal,
    quizQuestions: activeQuizPool,
    currentQuizIndex,
    selectedQuizAnswer,
    quizScore,
    isQuizFinished,
    isGeneratingAiQuiz,
    badges: computedBadges,
    rivals: INITIAL_RIVALS,
    rivalWins,
    rivalMatches,
  };

  const suggestedPrompts = useMemo(
    () => getSuggestedPromptsForLevel(selectedEducationLevel, selectedClass),
    [selectedEducationLevel, selectedClass]
  );

  // ==========================================================================
  // 8. RENDER AUTH GATE OR MAIN MIMI 15 APP
  // ==========================================================================
  if (isAuthChecking) {
    return (
      <div className="min-h-screen w-full bg-[#0B1120] text-slate-200 flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <div className="text-lg font-extrabold text-white">Mimi 15</div>
          <div className="text-xs text-slate-400">
            Memverifikasi sesi keamanan terenkripsi...
          </div>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <SignInScreen
        isLoading={isSigningIn}
        errorMessage={signInError}
        onLoginEmail={handleLoginEmail}
        onRegisterEmail={handleRegisterEmail}
        onGoogleQuickSignIn={handleGoogleQuickSignIn}
      />
    );
  }

  const renderActiveScreen = () => {
    switch (currentTab) {
      case BottomNavTab.BERANDA:
        return (
          <HomeScreen
            uiState={uiState}
            levels={currentLevels}
            studyProgress={studyProgress}
            milestones={milestones}
            onSelectEducationLevel={handleSelectEducationLevel}
            onSelectClass={handleSelectClass}
            onLevelClick={(item) => setActiveLevelModal(item)}
            onCompleteLevel={handleCompleteLevel}
            onCloseLevelModal={() => setActiveLevelModal(null)}
            onAskMimiTopic={handleAskMimiTopic}
            onAddMilestone={handleAddMilestone}
            onDeleteMilestone={handleDeleteMilestone}
          />
        );
      case BottomNavTab.TANTANGAN:
        return (
          <TantanganScreen
            uiState={uiState}
            onChallengeRival={handleChallengeRival}
            onOpenLeaderboard={() => setCurrentTab(BottomNavTab.PERINGKAT)}
          />
        );
      case BottomNavTab.PERINGKAT:
        return (
          <PeringkatScreen
            uiState={uiState}
            leaderboard={leaderboard}
            isLoading={isLeaderboardLoading}
            lastUpdated={leaderboardUpdatedAt}
            onRefresh={fetchLeaderboard}
            onNavigateTab={setCurrentTab}
          />
        );
      case BottomNavTab.KUIS:
        return (
          <KuisScreen
            uiState={uiState}
            onAnswerSelected={handleAnswerQuiz}
            onNextQuestion={handleNextQuizQuestion}
            onRestartQuiz={handleRestartQuiz}
            onGenerateAiQuiz={handleGenerateAiQuiz}
          />
        );
      case BottomNavTab.LENCANA:
        return <LencanaScreen badges={computedBadges} />;
      case BottomNavTab.PROFIL:
        return (
          <ProfilScreen
            uiState={uiState}
            authUser={authUser}
            studyProgress={studyProgress}
            milestones={milestones}
            onAddMilestone={handleAddMilestone}
            onDeleteMilestone={handleDeleteMilestone}
            onUpdateProfileSecurity={handleUpdateProfileSecurity}
            onSignOut={handleSignOut}
          />
        );
    }
  };

  return (
    <div className="h-screen w-full bg-[#0B1120] text-slate-100 overflow-hidden flex flex-col">
      {/* Share & Download Hub Dialog */}
      {isShareHubOpen && (
        <ShareAndDownloadHubDialog
          uiState={uiState}
          studyProgress={studyProgress}
          onDismiss={() => setIsShareHubOpen(false)}
        />
      )}

      {isWideScreen ? (
        // ══════════════════════════════════════════════════════════════════
        // DESKTOP PC WEB LAYOUT (Wide browser viewport)
        // ══════════════════════════════════════════════════════════════════
        <div className="flex-1 flex h-full overflow-hidden">
          {/* 1. Desktop Left Navigation Rail */}
          <CyberNavigationRail
            currentTab={currentTab}
            onTabSelected={setCurrentTab}
            uiState={uiState}
            isChatOpen={isChatOpen}
            onToggleChat={() => setIsChatOpen(!isChatOpen)}
            onOpenShareHub={() => setIsShareHubOpen(true)}
          />

          {/* 2. Main Content Canvas + Top Web Bar */}
          <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#0B1120]">
            <WebTopBar
              uiState={uiState}
              onSelectTab={setCurrentTab}
              isChatOpen={isChatOpen}
              isChatDocked={isChatDocked}
              onToggleChat={() => setIsChatOpen(!isChatOpen)}
              onToggleDock={() => setIsChatDocked(!isChatDocked)}
              onOpenShareHub={() => setIsShareHubOpen(true)}
            />

            <main className="flex-1 overflow-y-auto px-6 py-6">
              <div
                className={`mx-auto w-full ${
                  isChatOpen && isChatDocked ? 'max-w-3xl' : 'max-w-5xl'
                }`}
              >
                {renderActiveScreen()}
              </div>
            </main>

            {/* Floating Tutor Trigger on PC when closed */}
            <MimiFloatingDockWidget
              isOpen={isChatOpen}
              isWideScreen={true}
              onClick={() => setIsChatOpen(true)}
            />

            {/* Floating Desktop Chat Window (when not docked) */}
            {isChatOpen && !isChatDocked && (
              <MimiDesktopFloatingChatWindow
                isOpen={true}
                isDocked={false}
                onDismiss={() => setIsChatOpen(false)}
                onToggleDock={() => setIsChatDocked(true)}
                messages={chatMessages}
                isTyping={isMimiTyping}
                suggestedPrompts={suggestedPrompts}
                selectedLevel={selectedEducationLevel}
                selectedClass={selectedClass}
                onSelectLevel={handleSelectEducationLevel}
                onSelectClass={handleSelectClass}
                onSendMessage={handleSendMessageToMimi}
                latestXpNotification={latestXpNotification}
              />
            )}
          </div>

          {/* 3. Docked Right Side-Pane Chat (when isChatDocked == true) */}
          {isChatOpen && isChatDocked && (
            <MimiDesktopFloatingChatWindow
              isOpen={true}
              isDocked={true}
              onDismiss={() => setIsChatOpen(false)}
              onToggleDock={() => setIsChatDocked(false)}
              messages={chatMessages}
              isTyping={isMimiTyping}
              suggestedPrompts={suggestedPrompts}
              selectedLevel={selectedEducationLevel}
              selectedClass={selectedClass}
              onSelectLevel={handleSelectEducationLevel}
              onSelectClass={handleSelectClass}
              onSendMessage={handleSendMessageToMimi}
              latestXpNotification={latestXpNotification}
            />
          )}
        </div>
      ) : (
        // ══════════════════════════════════════════════════════════════════
        // MOBILE SMARTPHONE LAYOUT (Compact portrait)
        // ══════════════════════════════════════════════════════════════════
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Compact Mobile Header */}
          <header className="px-4 py-3 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
            <div className="text-base font-extrabold text-white whitespace-nowrap shrink-0">
              Mimi 15
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsShareHubOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-medium text-slate-200 whitespace-nowrap shrink-0"
              >
                Laporan
              </button>
              <span className="font-mono text-xs font-bold text-sky-400 tabular-nums">
                {xp} XP
              </span>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 py-4">
            {renderActiveScreen()}
          </main>

          <MimiFloatingDockWidget
            isOpen={isChatOpen}
            isWideScreen={false}
            onClick={() => setIsChatOpen(true)}
          />

          <CyberBottomBar
            currentTab={currentTab}
            onTabSelected={setCurrentTab}
          />

          <MimiChatBottomSheet
            isOpen={isChatOpen}
            onDismiss={() => setIsChatOpen(false)}
            messages={chatMessages}
            isTyping={isMimiTyping}
            suggestedPrompts={suggestedPrompts}
            selectedLevel={selectedEducationLevel}
            selectedClass={selectedClass}
            onSelectLevel={handleSelectEducationLevel}
            onSelectClass={handleSelectClass}
            onSendMessage={handleSendMessageToMimi}
            latestXpNotification={latestXpNotification}
          />
        </div>
      )}
    </div>
  );
}
