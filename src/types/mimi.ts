export enum BottomNavTab {
  BERANDA = 'BERANDA',
  TANTANGAN = 'TANTANGAN',
  PERINGKAT = 'PERINGKAT',
  KUIS = 'KUIS',
  LENCANA = 'LENCANA',
  PROFIL = 'PROFIL',
}

export interface LeaderboardEntry {
  uid: string;
  rankPosition: number;
  displayName: string;
  educationLevel: EducationLevel;
  selectedClass: string;
  xp: number;
  level: number;
  cyberRank: string;
  streakDays: number;
  completedModules: number;
  rivalWins: number;
  isCurrentUser?: boolean;
}

export enum EducationLevel {
  SD = 'SD',
  SMP = 'SMP',
  SMA = 'SMA',
}

export interface SimulationConfig {
  type: 'RATIO_LAB' | 'CIRCUIT_LOGIC' | 'NEWTON_FORCE' | 'FRACTION_VISUAL' | 'CYBER_CIPHER' | 'ALGEBRA_BALANCE';
  title: string;
  parameterLabel: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  targetValue: number;
  formulaDisplay: string;
  explanation: string;
}

export interface LevelItem {
  id: string;
  levelNumber: number;
  title: string;
  subtitle: string;
  subject: string;
  educationLevel: EducationLevel;
  classRange: string;
  xpReward: number;
  estimatedMinutes: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  summaryPoints: string[];
  practiceQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  simulation: SimulationConfig;
}

export interface StudyProgress {
  completedLevelIds: string[];
  totalModulesCompleted: number;
  totalQuizzesTaken: number;
  correctQuizAnswers: number;
  totalQuizQuestions: number;
  studyMinutes: number;
  lastStudiedTopic: string;
  lastUpdated: string;
}

export interface LearningMilestone {
  id: string;
  title: string;
  xpGain: number;
  createdAt: string;
  completed: boolean;
  category: string;
}

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: 'AKADEMIK' | 'ARENA' | 'STREAK' | 'EKSPLORASI';
  xpBonus: number;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedAt?: string;
}

export interface QuizQuestion {
  id: string;
  educationLevel: EducationLevel;
  classLabel: string;
  subject: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  xpReward: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'mimi';
  text: string;
  timestamp: string;
  xpEarned?: number;
  educationContext?: string;
}

export interface RivalProfile {
  id: string;
  name: string;
  title: string;
  school: string;
  educationLevel: EducationLevel;
  xp: number;
  winRate: number;
  specialty: string;
  difficulty: 'Mudah' | 'Menengah' | 'Tinggi';
  xpStake: number;
}

export interface SecurityAuditEntry {
  id: string;
  action: string;
  method: string;
  timestamp: string;
  status: 'TERVERIFIKASI' | 'PERINGATAN';
}

export interface AuthUser {
  uid: string;
  displayName: string;
  email: string;
  authMethod: 'PBKDF2_SCRYPT' | 'GOOGLE_VERIFIED';
  hasSecurityPin: boolean;
  createdAt: string;
  lastLoginAt: string;
  securityAudit: SecurityAuditEntry[];
}

export interface MimiUiState {
  currentTab: BottomNavTab;
  selectedEducationLevel: EducationLevel;
  selectedClass: string;
  studentName: string;
  studentEmail: string;
  xp: number;
  level: number;
  streakDays: number;
  cyberRank: string;
  isChatOpen: boolean;
  isMimiTyping: boolean;
  chatMessages: ChatMessage[];
  latestXpNotification: string | null;
  currentLevels: LevelItem[];
  activeLevelModal: LevelItem | null;
  quizQuestions: QuizQuestion[];
  currentQuizIndex: number;
  selectedQuizAnswer: number | null;
  quizScore: number;
  isQuizFinished: boolean;
  isGeneratingAiQuiz: boolean;
  badges: BadgeItem[];
  rivals: RivalProfile[];
  rivalWins: number;
  rivalMatches: number;
}
