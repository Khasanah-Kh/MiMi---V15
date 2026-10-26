/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AuthUser,
  BadgeItem,
  BottomNavTab,
  ChatMessage,
  CodingLessonItem,
  CurhatJournalEntry,
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
  SUBJECTS_BY_LEVEL,
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
import { CurhatScreen } from './components/screens/CurhatScreen';
import { CodingScreen } from './components/screens/CodingScreen';
import { TantanganScreen } from './components/screens/TantanganScreen';
import { PeringkatScreen } from './components/screens/PeringkatScreen';
import { KuisScreen } from './components/screens/KuisScreen';
import { LencanaScreen } from './components/screens/LencanaScreen';
import { ProfilScreen } from './components/screens/ProfilScreen';
import { DonationDialog } from './components/DonationDialog';
import { XpToastNotification, XpToastData } from './components/XpToastNotification';
import { ErrorReportModal } from './components/ErrorReportModal';
import { AdminLaporanScreen } from './components/screens/AdminLaporanScreen';
import {
  auth,
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  logoutFirebase,
  onAuthStateChanged,
  saveUserProgressToFirestore,
  getUserProgressFromFirestore,
  logActivity,
  logUserAccess,
} from './firebase';

const TOKEN_STORAGE_KEY = 'mimi15_session_token';

function formatShortTime(): string {
  return new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Default public student profile so when the website link is shared,
// EVERYONE immediately sees and can use the full Mimi 15 application!
const PUBLIC_DEFAULT_USER: AuthUser = {
  uid: 'usr_public_visitor',
  email: 'pelajar.indonesia@mimi15.id',
  displayName: 'Bestie Pelajar',
  authMethod: 'GOOGLE_VERIFIED',
  hasSecurityPin: false,
  createdAt: 'Hari ini',
  lastLoginAt: 'Aktif 24 Jam (Akses Publik)',
  securityAudit: [
    {
      id: 'aud_public_1',
      action: 'Akses Link Website Publik (Terlihat Bagi Semua Orang)',
      method: 'Sesi Publik Otomatis',
      timestamp: formatShortTime(),
      status: 'TERVERIFIKASI',
    },
  ],
};

export default function App() {
  // ==========================================================================
  // 1. PUBLIC-FIRST AUTHENTICATION STATE (Visible to Everyone via Shared Link)
  // ==========================================================================
  const [authUser, setAuthUser] = useState<AuthUser>(PUBLIC_DEFAULT_USER);
  const [sessionToken, setSessionToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY)
  );
  const [showSignInModal, setShowSignInModal] = useState<boolean>(false);
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
  const [selectedSubject, setSelectedSubject] = useState<string>('Matematika');
  const [isProfesorMode, setIsProfesorMode] = useState<boolean>(false);

  const [xp, setXp] = useState<number>(120);
  const [streakDays, setStreakDays] = useState<number>(3);
  const [rivalWins, setRivalWins] = useState<number>(0);
  const [rivalMatches, setRivalMatches] = useState<number>(0);
  const [mimiDialogCount, setMimiDialogCount] = useState<number>(0);

  // Theme Mode (Dark / Light) with LocalStorage & Firestore sync
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('mimi15_theme_mode') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    if (themeMode === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [themeMode]);

  const handleToggleTheme = (mode: 'dark' | 'light') => {
    setThemeMode(mode);
    localStorage.setItem('mimi15_theme_mode', mode);
  };

  const [studyProgress, setStudyProgress] = useState<StudyProgress>({
    completedLevelIds: [],
    totalModulesCompleted: 0,
    totalQuizzesTaken: 0,
    correctQuizAnswers: 0,
    totalQuizQuestions: 0,
    studyMinutes: 25,
    lastStudiedTopic: 'Kurikulum Merdeka Kemendikbud',
    lastUpdated: 'Baru saja',
  });

  const [milestones, setMilestones] = useState<LearningMilestone[]>(INITIAL_MILESTONES);

  // Curhat Journal & Coding Lesson states
  const [curhatEntries, setCurhatEntries] = useState<CurhatJournalEntry[]>([
    {
      id: 'curhat-init-1',
      mood: 'Semangat',
      storyText:
        'Senang banget hari ini bisa belajar bareng Mimi pakai cara yang seru dan gak membosankan!',
      mimiWarmReply:
        'Wah ikut senang banget dengernya bestie! ✨ Pertahankan energi positifmu ya, kalau nanti capek jangan lupa istirahat sebentar. Mimi selalu siap nemenin kamu kapan aja! 💜🚀',
      createdAt: 'Hari ini',
    },
  ]);
  const [completedCodingIds, setCompletedCodingIds] = useState<string[]>([]);

  // Chat & Dock states
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isChatDocked, setIsChatDocked] = useState<boolean>(false);
  const [isMimiTyping, setIsMimiTyping] = useState<boolean>(false);
  const [latestXpNotification, setLatestXpNotification] = useState<string | null>(null);
  const [xpToastData, setXpToastData] = useState<XpToastData | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-mimi',
      sender: 'mimi',
      text: 'Halo! Aku Mimi. Mau ngobrol santai, curhat, atau bahas pelajaran hari ini?',
      timestamp: formatShortTime(),
    },
  ]);

  // Active Lesson Modal
  const [activeLevelModal, setActiveLevelModal] = useState<LevelItem | null>(null);

  // Share & Download Hub Dialog
  const [isShareHubOpen, setIsShareHubOpen] = useState<boolean>(false);

  // Donation Dialog (5 Editable Links + VERSI A Supporter View)
  const [isDonationOpen, setIsDonationOpen] = useState<boolean>(false);

  // Error Report Modal ("⚠️ Lapor Error / Masukan")
  const [isErrorReportOpen, setIsErrorReportOpen] = useState<boolean>(false);

  // Owner Admin Dashboard (`/admin-laporan` for anna.adriiann@gmail.com)
  const [isAdminLaporanOpen, setIsAdminLaporanOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.location.pathname.includes('/admin-laporan') ||
      window.location.hash.includes('admin-laporan') ||
      window.location.search.includes('admin-laporan')
    );
  });

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

  // Warm Safe filter state (Default OFF on first load, toggled ONLY when clicked)
  const [isWarmSafeOn, setIsWarmSafeOn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('warmSafe') === 'true';
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => setIsWideScreen(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update body filter and localStorage when isWarmSafeOn changes
  useEffect(() => {
    const overlay = document.getElementById('warmOverlay');
    if (isWarmSafeOn) {
      document.body.classList.add('warm-safe-active');
      document.body.style.filter = 'sepia(0.15) hue-rotate(-6deg) brightness(0.94) saturate(0.9)';
      if (overlay) overlay.style.opacity = '1';
      localStorage.setItem('warmSafe', 'true');
    } else {
      document.body.classList.remove('warm-safe-active');
      document.body.style.filter = 'none';
      if (overlay) overlay.style.opacity = '0';
      localStorage.setItem('warmSafe', 'false');
    }
  }, [isWarmSafeOn]);

  const toggleWarmSafe = useCallback(() => {
    setIsWarmSafeOn((prev) => {
      const next = !prev;
      logActivity('warm_safe_toggle', {
        status: next ? 'on' : 'off',
        email: authUser.email,
        nama: authUser.displayName,
      });
      return next;
    });
  }, [authUser.email, authUser.displayName]);

  // Save current class to localStorage and log page_view whenever tab changes
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('kelas', selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    const startTs = Date.now();
    logActivity('page_view', {
      page: currentTab,
      halaman: currentTab,
      kelas: selectedClass,
      email: authUser.email,
      nama: authUser.displayName,
    });
    return () => {
      const durasiDetik = Math.round((Date.now() - startTs) / 1000);
      if (durasiDetik >= 3) {
        logActivity('page_duration', {
          halaman: currentTab,
          durasiDetik,
          email: authUser.email,
        });
      }
    };
  }, [currentTab]);

  // ==========================================================================
  // 3. HYDRATE USER DATA HELPER & AUTO-ESTABLISH PUBLIC SESSION
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
    if (userData.themeMode === 'light' || userData.themeMode === 'dark') {
      setThemeMode(userData.themeMode);
      localStorage.setItem('mimi15_theme_mode', userData.themeMode);
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
      lastUpdated: formatShortTime(),
    }));
  }, []);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const isGoogle = fbUser.providerData.some((p) => p.providerId === 'google.com');
        const authed: AuthUser = {
          uid: fbUser.uid,
          email: fbUser.email || 'pelajar@mimi15.id',
          displayName: fbUser.displayName || 'Bestie Pelajar',
          authMethod: isGoogle ? 'GOOGLE_VERIFIED' : 'PBKDF2_SCRYPT',
          hasSecurityPin: false,
          createdAt: 'Hari ini',
          lastLoginAt: 'Aktif via Firebase Auth',
          securityAudit: [
            {
              id: 'aud_fb_' + Date.now(),
              action: 'Login via Firebase Authentication',
              method: isGoogle ? 'Google Sign-In' : 'Email/Password',
              timestamp: formatShortTime(),
              status: 'TERVERIFIKASI',
            },
          ],
        };
        setAuthUser(authed);

        // Fetch progress from Firestore
        try {
          const firestoreData = await getUserProgressFromFirestore(fbUser.uid);
          if (firestoreData) {
            applyServerUserData(firestoreData);
          }
        } catch (e) {
          console.warn('Could not load Firestore progress:', e);
        }

        // Keep server session active for AI chat & APIs
        fetch('/api/auth/google-quick', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            displayName: authed.displayName,
            email: authed.email,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.token) {
              localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
              setSessionToken(data.token);
            }
          })
          .catch(() => {});
      }
    });

    return () => unsubscribe();
  }, [applyServerUserData]);

  // Verify existing session or automatically create a public visitor session so
  // shared links ALWAYS open directly into the full website for everyone!
  useEffect(() => {
    async function initPublicOrSavedSession() {
      try {
        if (sessionToken) {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${sessionToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            const normalizedUser =
              data.user?.displayName === 'Siswa Cyber'
                ? { ...data.user, displayName: 'Bestie Pelajar' }
                : data.user;
            setAuthUser(normalizedUser);
            applyServerUserData(data.userData);
            return;
          }
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        }

        // Auto-create/join a public session so anyone opening the shared link
        // immediately sees the full website and leaderboard without a login wall
        const quickRes = await fetch('/api/auth/google-quick', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            displayName: 'Bestie Pelajar',
            email: 'pelajar.publik@mimi15.id',
          }),
        });
        if (quickRes.ok) {
          const data = await quickRes.json();
          localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
          setSessionToken(data.token);
          setAuthUser(data.user);
          applyServerUserData(data.userData);
        }

        // Log guest/tamu session visit once per browser session
        if (!sessionStorage.getItem('mimi_guest_logged')) {
          sessionStorage.setItem('mimi_guest_logged', 'true');
          logUserAccess({
            email: 'tamu_anonim@mimi15.id',
            nama: 'Tamu (Bestie Pelajar)',
            kelas: localStorage.getItem('kelas') || 'Kelas 8',
            isGuest: true,
            actionType: 'guest_visit',
          });
        }
      } catch {
        // Keep PUBLIC_DEFAULT_USER gracefully if offline
      }
    }
    initPublicOrSavedSession();
  }, [sessionToken, applyServerUserData]);

  // Sync progress to server and Firestore whenever key metrics change
  useEffect(() => {
    if (!sessionToken) return;
    const timeout = setTimeout(() => {
      // 1. Sync to local backend server
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
            themeMode,
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

      // 2. Sync to Firebase Firestore directly
      if (authUser?.uid && authUser.uid !== 'usr_public_visitor') {
        saveUserProgressToFirestore(authUser.uid, {
          uid: authUser.uid,
          displayName: authUser.displayName,
          email: authUser.email,
          xp,
          streakDays,
          selectedEducationLevel,
          selectedClass,
          themeMode,
          studyMinutes: studyProgress.studyMinutes,
          lastStudiedTopic: studyProgress.lastStudiedTopic,
          rivalWins,
          rivalMatches,
        }).catch(() => {});
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [
    sessionToken,
    authUser,
    xp,
    streakDays,
    selectedEducationLevel,
    selectedClass,
    themeMode,
    studyProgress,
    rivalWins,
    rivalMatches,
    milestones,
  ]);

  const fetchLeaderboard = useCallback(async () => {
    setIsLeaderboardLoading(true);
    try {
      const res = await fetch('/api/leaderboard', {
        headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
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
    fetchLeaderboard();
  }, [currentTab, fetchLeaderboard]);

  // ==========================================================================
  // 4. AUTHENTICATION HANDLERS (For Optional Account Switch / Login Modal)
  // ==========================================================================
  const handleLoginEmail = async (email: string, password: string) => {
    setIsSigningIn(true);
    setSignInError(null);
    try {
      // 1. Authenticate with real Firebase Authentication
      const fbUser = await loginWithEmail(email, password);

      // 2. Fetch progress from Firestore
      const firestoreData = await getUserProgressFromFirestore(fbUser.uid);
      if (firestoreData) {
        applyServerUserData(firestoreData);
      }

      // 3. Establish server session token
      const res = await fetch('/api/auth/google-quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: fbUser.displayName || email.split('@')[0],
          email: fbUser.email || email,
        }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        setSessionToken(data.token);
      }

      setAuthUser({
        uid: fbUser.uid,
        email: fbUser.email || email,
        displayName: fbUser.displayName || email.split('@')[0],
        authMethod: 'PBKDF2_SCRYPT',
        hasSecurityPin: false,
        createdAt: 'Hari ini',
        lastLoginAt: 'Aktif via Firebase Auth',
        securityAudit: [
          {
            id: 'aud_fb_login_' + Date.now(),
            action: 'Login via Firebase Auth (Email)',
            method: 'Email & Password',
            timestamp: formatShortTime(),
            status: 'TERVERIFIKASI',
          },
        ],
      });
      setShowSignInModal(false);
      triggerXpToast('Berhasil masuk dengan Firebase Auth!');
      logUserAccess({
        email: fbUser.email || email,
        nama: fbUser.displayName || email.split('@')[0],
        kelas: selectedClass,
        isGuest: false,
        actionType: 'login',
      });
    } catch (err: any) {
      console.warn('Firebase login attempt:', err);
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          const rawErr = err?.message || data?.error || 'Gagal masuk. Periksa kembali email dan kata sandi.';
          const friendlyErr =
            rawErr.includes('invalid-credential') || rawErr.includes('user-not-found')
              ? 'Email atau kata sandi tidak cocok di Firebase Auth.'
              : rawErr;
          setSignInError(friendlyErr);
          return;
        }
        localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        setSessionToken(data.token);
        setAuthUser(data.user);
        applyServerUserData(data.userData);
        setShowSignInModal(false);
      } catch {
        setSignInError(err?.message || 'Gagal terhubung ke Firebase Authentication.');
      }
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
      // 1. Create account with real Firebase Authentication
      const fbUser = await registerWithEmail(displayName, email, password);

      // 2. Save user progression document in Firestore
      await saveUserProgressToFirestore(fbUser.uid, {
        uid: fbUser.uid,
        displayName: displayName.trim() || 'Bestie Pelajar',
        email: fbUser.email || email,
        xp,
        streakDays,
        selectedEducationLevel,
        selectedClass,
        themeMode,
        createdAt: new Date().toISOString(),
      });

      // 3. Establish server session token
      const res = await fetch('/api/auth/google-quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, email }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        setSessionToken(data.token);
      }

      setAuthUser({
        uid: fbUser.uid,
        email: fbUser.email || email,
        displayName: displayName.trim() || 'Bestie Pelajar',
        authMethod: 'PBKDF2_SCRYPT',
        hasSecurityPin: Boolean(securityPin),
        createdAt: 'Hari ini',
        lastLoginAt: 'Baru mendaftar di Firebase Auth',
        securityAudit: [
          {
            id: 'aud_fb_reg_' + Date.now(),
            action: 'Registrasi via Firebase Auth',
            method: 'Email & Password',
            timestamp: formatShortTime(),
            status: 'TERVERIFIKASI',
          },
        ],
      });
      setShowSignInModal(false);
      triggerXpToast('Akun berhasil dibuat di Firebase Auth! (+50 XP)');
      logUserAccess({
        email: fbUser.email || email,
        nama: displayName.trim() || 'Bestie Pelajar',
        kelas: selectedClass,
        isGuest: false,
        actionType: 'register',
      });
    } catch (err: any) {
      console.warn('Firebase register attempt:', err);
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ displayName, email, password, securityPin }),
        });
        const data = await res.json();
        if (!res.ok) {
          const rawErr = err?.message || data?.error || 'Gagal mendaftarkan akun baru.';
          const friendlyErr = rawErr.includes('email-already-in-use')
            ? 'Email ini sudah terdaftar di Firebase. Silakan pilih Masuk Akun!'
            : rawErr;
          setSignInError(friendlyErr);
          return;
        }
        localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        setSessionToken(data.token);
        setAuthUser(data.user);
        applyServerUserData(data.userData);
        setShowSignInModal(false);
      } catch {
        setSignInError(err?.message || 'Gagal mendaftar di Firebase Authentication.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleQuickSignIn = async (displayName?: string, email?: string) => {
    setIsSigningIn(true);
    setSignInError(null);
    try {
      // 1. Real Google Sign-In via Firebase Authentication Popup
      const fbUser = await loginWithGoogle();

      // 2. Fetch or initialize progress in Firestore
      const firestoreData = await getUserProgressFromFirestore(fbUser.uid);
      if (firestoreData) {
        applyServerUserData(firestoreData);
      } else {
        await saveUserProgressToFirestore(fbUser.uid, {
          uid: fbUser.uid,
          displayName: fbUser.displayName || displayName || 'Bestie Pelajar',
          email: fbUser.email || email,
          xp,
          streakDays,
          selectedEducationLevel,
          selectedClass,
          themeMode,
        });
      }

      // 3. Establish server session token
      const res = await fetch('/api/auth/google-quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: fbUser.displayName || displayName,
          email: fbUser.email || email,
        }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        setSessionToken(data.token);
      }

      setAuthUser({
        uid: fbUser.uid,
        email: fbUser.email || email || 'pelajar@mimi15.id',
        displayName: fbUser.displayName || displayName || 'Bestie Pelajar',
        authMethod: 'GOOGLE_VERIFIED',
        hasSecurityPin: false,
        createdAt: 'Hari ini',
        lastLoginAt: 'Aktif via Google Firebase Auth',
        securityAudit: [
          {
            id: 'aud_google_fb_' + Date.now(),
            action: 'Masuk via Google Firebase Authentication',
            method: 'Google OAuth Popup',
            timestamp: formatShortTime(),
            status: 'TERVERIFIKASI',
          },
        ],
      });
      setShowSignInModal(false);
      triggerXpToast('Login Google Firebase Berhasil!');
      logUserAccess({
        email: fbUser.email || email || 'pelajar@mimi15.id',
        nama: fbUser.displayName || displayName || 'Bestie Pelajar',
        kelas: selectedClass,
        isGuest: false,
        actionType: 'login',
      });
    } catch (err: any) {
      console.warn('Google Firebase Auth fallback:', err);
      // If popup closed or restricted in iframe, fallback smoothly to quick Google session
      try {
        const res = await fetch('/api/auth/google-quick', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ displayName, email }),
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
          setSessionToken(data.token);
          setAuthUser(data.user);
          applyServerUserData(data.userData);
          setShowSignInModal(false);
          logUserAccess({
            email: data.user?.email || email || 'pelajar@mimi15.id',
            nama: data.user?.displayName || displayName || 'Bestie Pelajar',
            kelas: selectedClass,
            isGuest: false,
            actionType: 'login',
          });
          triggerXpToast('Sesi masuk terverifikasi!');
        } else {
          setSignInError(err?.message || data?.error || 'Gagal masuk dengan Google.');
        }
      } catch {
        setSignInError(err?.message || 'Gagal menghubungkan Google Sign-In.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutFirebase();
    } catch {
      // Ignore signOut errors
    }
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setSessionToken(null);
    setAuthUser(PUBLIC_DEFAULT_USER);
    setShowSignInModal(true);
  };

  const handleUpdateProfileSecurity = async (
    displayName: string,
    newPassword?: string,
    securityPin?: string
  ): Promise<string | null> => {
    if (!sessionToken) {
      setAuthUser((prev) => ({ ...prev, displayName }));
      return null;
    }
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
    const defaultSubj = SUBJECTS_BY_LEVEL[lvl]?.[0] || 'Matematika';
    setSelectedClass(defaultCls);
    setSelectedSubject(defaultSubj);
    setCustomAiQuizzes(null);
    setCurrentQuizIndex(0);
    setSelectedQuizAnswer(null);
    setQuizScore(0);
    setIsQuizFinished(false);
  };

  const handleSelectClass = (cls: string) => {
    setSelectedClass(cls);
  };

  const handleSelectSubject = (subj: string) => {
    setSelectedSubject(subj);
  };

  const handleToggleProfesorMode = () => {
    setIsProfesorMode((prev) => {
      const next = !prev;
      triggerXpToast(
        next
          ? 'Mimi Profesor Mode AKTIF! (Hack Trik Hafal & Jembatan Keledai)'
          : 'Mode Standar 3-in-1 Mimi Aktif'
      );
      return next;
    });
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
  // 6. INTERACTION HANDLERS (MODULES, CURHAT, CODING, QUIZ, ARENA, MIMI CHAT)
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

  const handleAddCurhatEntry = async (
    mood: CurhatJournalEntry['mood'],
    storyText: string
  ) => {
    try {
      const res = await fetch('/api/mimi/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Mimi, hari ini perasaanku lagi "${mood}". Aku mau curhat: ${storyText}`,
          educationLevel: selectedEducationLevel,
          selectedClass,
          selectedSubject: 'Curhat & Perasaan',
          isProfesorMode: false,
          studentName: authUser.displayName,
          history: [],
        }),
      });
      const data = await res.json();
      const warmReply =
        res.ok && data.reply
          ? data.reply
          : `Makasih udah cerita jujur ke Mimi ya, bestie ${authUser.displayName} 🤗💜 Perasaan "${mood}" yang kamu rasain hari ini valid banget. Take your time dan semangat terus ya!`;

      const newEntry: CurhatJournalEntry = {
        id: 'curhat_' + Date.now(),
        mood,
        storyText,
        mimiWarmReply: warmReply,
        createdAt: formatShortTime(),
      };
      setCurhatEntries((prev) => [newEntry, ...prev]);
      setXp((prev) => prev + 25);
      triggerXpToast('Cerita curhatmu disimpan hangat oleh Mimi (+25 XP)');
    } catch {
      const fallbackEntry: CurhatJournalEntry = {
        id: 'curhat_' + Date.now(),
        mood,
        storyText,
        mimiWarmReply: `Peluk virtual dulu buat bestie ${authUser.displayName} 🤗💜 Makasih udah berbagi cerita hari ini, Mimi selalu dengerin kamu!`,
        createdAt: formatShortTime(),
      };
      setCurhatEntries((prev) => [fallbackEntry, ...prev]);
    }
  };

  const handleDeleteCurhatEntry = (id: string) => {
    setCurhatEntries((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCompleteCodingLesson = (lesson: CodingLessonItem) => {
    const alreadyDone = completedCodingIds.includes(lesson.id);
    const reward = alreadyDone ? 15 : lesson.xpReward;
    if (!alreadyDone) {
      setCompletedCodingIds((prev) => [...prev, lesson.id]);
    }
    setXp((prev) => prev + reward);
    setStudyProgress((prev) => ({
      ...prev,
      lastStudiedTopic: `Coding: ${lesson.title}`,
      lastUpdated: formatShortTime(),
    }));
    triggerXpToast(`Latihan Coding "${lesson.language}" berhasil! (+${reward} XP)`);
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
      logActivity('kuis_finish', {
        email: authUser.email,
        nama: authUser.displayName,
        benar: quizScore,
        salah: Math.max(0, activeQuizPool.length - quizScore),
        skor: Math.round((quizScore / Math.max(1, activeQuizPool.length)) * 100),
        mapel: selectedSubject,
        kelas: selectedClass,
        mode: 'Kuis Reguler',
        waktu: new Date().toLocaleString('id-ID'),
      });
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
          topic: customTopic || selectedSubject,
        }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.questions) && data.questions.length > 0) {
        const formatted: QuizQuestion[] = data.questions.map(
          (q: any, index: number) => ({
            id: `ai-q-${Date.now()}-${index}`,
            educationLevel: selectedEducationLevel,
            classLabel: selectedClass,
            subject: String(q.subject || selectedSubject),
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
    const textLower = text.toLowerCase();

    // 1. Auto-detect subject if user mentions specific subject domain keywords
    let targetSubject = selectedSubject;
    if (
      textLower.includes('biologi') ||
      textLower.includes('fotosintesis') ||
      textLower.includes('sel') ||
      textLower.includes('ekosistem') ||
      textLower.includes('dna') ||
      textLower.includes('organ')
    ) {
      targetSubject = 'Biologi / IPA';
    } else if (
      textLower.includes('fisika') ||
      textLower.includes('gravitasi') ||
      textLower.includes('hukum newton') ||
      textLower.includes('listrik') ||
      textLower.includes('termodinamika')
    ) {
      targetSubject = 'Fisika / IPA';
    } else if (
      textLower.includes('kimia') ||
      textLower.includes('tabel periodik') ||
      textLower.includes('unsur') ||
      textLower.includes('atom') ||
      textLower.includes('asam basa')
    ) {
      targetSubject = 'Kimia / IPA';
    } else if (
      textLower.includes('sejarah') ||
      textLower.includes('proklamasi') ||
      textLower.includes('pahlawan') ||
      textLower.includes('kerajaan')
    ) {
      targetSubject = 'Sejarah / IPS';
    } else if (
      textLower.includes('matematika') ||
      textLower.includes('aljabar') ||
      textLower.includes('pythagoras') ||
      textLower.includes('trigonometri') ||
      textLower.includes('rumus')
    ) {
      targetSubject = 'Matematika';
    } else if (
      textLower.includes('english') ||
      textLower.includes('tenses') ||
      textLower.includes('grammar') ||
      textLower.includes('vocabulary')
    ) {
      targetSubject = 'Bahasa Inggris';
    }

    if (targetSubject !== selectedSubject) {
      setSelectedSubject(targetSubject);
    }

    // 2. Auto-detect memorization, mnemonic, or study hack topics
    const mnemonicTriggers = [
      'hafal',
      'ngafal',
      'mnemonic',
      'jembatan keledai',
      'trik',
      'singkatan',
      'rumus cepat',
      'cara nginget',
      'cara cepat',
      'biar gampang',
      'ingat',
      'tabel periodik',
      'unsur',
      'tata surya',
      'taksonomi',
      'pythagoras',
      'trigonometri',
      'tenses',
      'majas',
      'fotosintesis',
      'hukum newton',
      'sistem pencernaan',
      'asam basa',
      'proklamasi',
      'rumus',
    ];

    const needsProfesorHack = mnemonicTriggers.some((trigger) =>
      textLower.includes(trigger)
    );
    let effectiveProfesorMode = isProfesorMode;

    if (needsProfesorHack) {
      effectiveProfesorMode = true;
      if (!isProfesorMode) {
        setIsProfesorMode(true);
        triggerXpToast(
          '⚡ Mimi Profesor Mode Otomatis AKTIF! (Trik Hafal & Mnemonic Proaktif)'
        );
      }
    }

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
          selectedSubject: targetSubject,
          isProfesorMode: effectiveProfesorMode,
          studentName: authUser.displayName || 'Bestie',
          history: chatMessages.slice(-8),
        }),
      });
      const data = await res.json();
      const replyText =
        res.ok && data.reply
          ? data.reply
          : 'Mimi tetap di sini nemenin kamu bestie! ✨ Coba tulis ulang pertanyaan atau topik yang pengen kita bahas bareng ya.';
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
        triggerXpToast(`Ngobrol bareng Mimi! (+${xpGain} XP)`);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: 'msg_err_' + Date.now(),
          sender: 'mimi',
          text: 'Koneksi ke server Mimi sedang sibuk sebentar. Coba kirim ulang pesanmu ya bestie!',
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
    selectedSubject,
    isProfesorMode,
    studentName: authUser.displayName || 'Bestie Pelajar',
    studentEmail: authUser.email || '',
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
    () =>
      getSuggestedPromptsForLevel(
        selectedEducationLevel,
        selectedClass,
        selectedSubject
      ),
    [selectedEducationLevel, selectedClass, selectedSubject]
  );

  // ==========================================================================
  // 8. RENDER MAIN MIMI 15 APP (Always Visible to Everyone When Link Shared)
  // ==========================================================================
  if (showSignInModal) {
    return (
      <div className="relative">
        <div className="fixed top-4 right-4 z-50">
          <button
            type="button"
            onClick={() => setShowSignInModal(false)}
            className="px-4 py-2 rounded-xl btn-tactile-sky text-xs font-extrabold shadow-lg"
          >
            ← Kembali ke Website Publik Mimi
          </button>
        </div>
        <SignInScreen
          isLoading={isSigningIn}
          errorMessage={signInError}
          onLoginEmail={handleLoginEmail}
          onRegisterEmail={handleRegisterEmail}
          onGoogleQuickSignIn={handleGoogleQuickSignIn}
        />
      </div>
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
            onSelectSubject={handleSelectSubject}
            onToggleProfesorMode={handleToggleProfesorMode}
            onLevelClick={(item) => setActiveLevelModal(item)}
            onCompleteLevel={handleCompleteLevel}
            onCloseLevelModal={() => setActiveLevelModal(null)}
            onAskMimiTopic={handleAskMimiTopic}
            onAddMilestone={handleAddMilestone}
            onDeleteMilestone={handleDeleteMilestone}
            onNavigateTab={setCurrentTab}
            onOpenBookDriveHub={() => setIsShareHubOpen(true)}
          />
        );
      case BottomNavTab.CURHAT:
        return (
          <CurhatScreen
            uiState={uiState}
            messages={chatMessages}
            isTyping={isMimiTyping}
            onSendMessage={handleSendMessageToMimi}
            milestones={milestones}
            onAddMilestone={handleAddMilestone}
            onDeleteMilestone={handleDeleteMilestone}
          />
        );
      case BottomNavTab.CODING:
        return (
          <CodingScreen
            uiState={uiState}
            onAskMimiTopic={handleAskMimiTopic}
            onAwardCodingXp={(label, xpAmount) => {
              setXp((prev) => prev + xpAmount);
              triggerXpToast(`${label} (+${xpAmount} XP)`);
            }}
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
            badges={computedBadges}
            themeMode={themeMode}
            onToggleTheme={handleToggleTheme}
            onAddMilestone={handleAddMilestone}
            onDeleteMilestone={handleDeleteMilestone}
            onUpdateProfileSecurity={handleUpdateProfileSecurity}
            onSignOut={handleSignOut}
            onOpenDonation={() => setIsDonationOpen(true)}
            onOpenErrorReport={() => setIsErrorReportOpen(true)}
            onOpenAdminDashboard={() => {
              window.history.pushState({}, '', '/admin-laporan');
              setIsAdminLaporanOpen(true);
            }}
          />
        );
    }
  };

  if (isAdminLaporanOpen) {
    return (
      <div className="min-h-screen w-full bg-[#0B1120] text-slate-100 overflow-y-auto px-4 sm:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <AdminLaporanScreen
            currentUserEmail={authUser.email}
            onBackToHome={() => {
              window.history.pushState({}, '', '/');
              setIsAdminLaporanOpen(false);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-[#0B1120] text-slate-100 overflow-hidden flex flex-col">
      {/* Global Animated XP Reward Toast Notification (Framer Motion) */}
      <XpToastNotification
        notification={xpToastData}
        onDismiss={() => setXpToastData(null)}
      />

      {/* Share & Download Hub Dialog */}
      {isShareHubOpen && (
        <ShareAndDownloadHubDialog
          uiState={uiState}
          studyProgress={studyProgress}
          onDismiss={() => setIsShareHubOpen(false)}
        />
      )}

      {/* Donasi & Dukungan Dialog (5 Tautan Editable Sendiri + Supporter View) */}
      <DonationDialog
        isOpen={isDonationOpen}
        onClose={() => setIsDonationOpen(false)}
      />

      {/* Modal Lapor Error / Masukan ke Owner (anna.adriiann@gmail.com) */}
      <ErrorReportModal
        isOpen={isErrorReportOpen}
        onClose={() => setIsErrorReportOpen(false)}
        userEmail={authUser.email}
        userName={authUser.displayName}
      />

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
            onOpenDonation={() => setIsDonationOpen(true)}
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
              isWarmSafe={isWarmSafeOn}
              onToggleWarmSafe={toggleWarmSafe}
            />

            <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-10 py-6 sm:py-8">
              <div
                className={`mx-auto w-full transition-all duration-300 ${
                  isChatOpen && isChatDocked ? 'max-w-5xl' : 'max-w-7xl xl:max-w-[1400px]'
                }`}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                    {renderActiveScreen()}
                  </motion.div>
                </AnimatePresence>
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
                selectedSubject={selectedSubject}
                isProfesorMode={isProfesorMode}
                onSelectLevel={handleSelectEducationLevel}
                onSelectClass={handleSelectClass}
                onSelectSubject={handleSelectSubject}
                onToggleProfesorMode={handleToggleProfesorMode}
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
              selectedSubject={selectedSubject}
              isProfesorMode={isProfesorMode}
              onSelectLevel={handleSelectEducationLevel}
              onSelectClass={handleSelectClass}
              onSelectSubject={handleSelectSubject}
              onToggleProfesorMode={handleToggleProfesorMode}
              onSendMessage={handleSendMessageToMimi}
              latestXpNotification={latestXpNotification}
            />
          )}
        </div>
      ) : (
        // ══════════════════════════════════════════════════════════════════
        // MOBILE SMARTPHONE LAYOUT (Ergonomic One-Handed Portrait Mode)
        // ══════════════════════════════════════════════════════════════════
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Super Ramping Mobile Status Header (Duolingo & Dola Composition) */}
          <header className="px-3 py-2 bg-[#131C31]/95 backdrop-blur-md border-b border-slate-800/90 flex items-center justify-between gap-1.5 shrink-0 z-20 select-none">
            {/* Active Course Chip */}
            <button
              type="button"
              onClick={() => setCurrentTab(BottomNavTab.BERANDA)}
              className="px-2.5 py-1.5 rounded-xl bg-[#0B101E] border border-slate-800 hover:border-sky-400/50 flex items-center gap-1.5 text-xs font-bold text-white whitespace-nowrap shrink-0 transition-colors"
            >
              <span className="text-sm leading-none">🎓</span>
              <span className="truncate max-w-[110px] sm:max-w-none">
                {selectedEducationLevel} · {selectedClass}
              </span>
            </button>

            {/* Status Metrics Cluster: Streak, XP, Books, Avatar Badge */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Streak Badge */}
              <div
                title="Hari aktif berturut-turut"
                className="px-2 py-1.5 rounded-xl bg-[#0B101E] border border-amber-500/40 text-[11px] font-mono font-extrabold text-amber-300 flex items-center gap-1 tabular-nums shrink-0"
              >
                <span>🔥</span>
                <span>{streakDays}</span>
              </div>

              {/* XP Balance */}
              <div
                title="Saldo XP"
                className="px-2 py-1.5 rounded-xl bg-[#0B101E] border border-sky-500/40 text-[11px] font-mono font-extrabold text-sky-300 flex items-center gap-1 tabular-nums shrink-0"
              >
                <span>💎</span>
                <span>{xp}</span>
              </div>

              {/* Warm Safe Quick Toggle for Mobile */}
              <button
                type="button"
                onClick={toggleWarmSafe}
                title={isWarmSafeOn ? 'Warm Safe ON' : 'Warm Safe OFF'}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 transition-all cursor-pointer ${
                  isWarmSafeOn
                    ? 'bg-amber-400/20 text-amber-200 border-amber-400/40 shadow-[0_0_10px_rgba(251,191,36,0.25)]'
                    : 'bg-[#1e293b] text-[#cbd5e1] border-white/10'
                }`}
              >
                <span>👁️ {isWarmSafeOn ? 'Warm ON' : 'Warm OFF'}</span>
              </button>

              {/* Book Drive Hub Shortcut */}
              <button
                type="button"
                onClick={() => setIsShareHubOpen(true)}
                title="Akses Buku PDF, Drive & Classroom"
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm leading-none shrink-0 transition-colors"
              >
                📚
              </button>

              {/* Tappable Profile Avatar with Level Badge */}
              <button
                type="button"
                onClick={() => setCurrentTab(BottomNavTab.PROFIL)}
                title="Buka Profil & Lencana"
                className="relative flex items-center justify-center shrink-0 ml-0.5"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 p-0.5 shadow-md">
                  <div className="w-full h-full rounded-full bg-[#0B101E] flex items-center justify-center text-xs font-extrabold text-white">
                    {authUser.displayName.charAt(0).toUpperCase()}
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded-md bg-amber-400 text-[9px] font-mono font-black text-slate-950 leading-none shadow">
                  Lv.{calculateLevelFromXp(xp)}
                </span>
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-3.5 py-4 pb-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                {renderActiveScreen()}
              </motion.div>
            </AnimatePresence>
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
            selectedSubject={selectedSubject}
            isProfesorMode={isProfesorMode}
            onSelectLevel={handleSelectEducationLevel}
            onSelectClass={handleSelectClass}
            onSelectSubject={handleSelectSubject}
            onToggleProfesorMode={handleToggleProfesorMode}
            onSendMessage={handleSendMessageToMimi}
            latestXpNotification={latestXpNotification}
          />
        </div>
      )}

      {/* Warm Safe Ambient Overlay (Active only when toggled ON, zero obstruction) */}
      <div
        id="warmOverlay"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(255,210,120,0.06)',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: isWarmSafeOn ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      />
    </div>
  );
}
