export enum BottomNavTab {
  BERANDA = 'BERANDA',
  CURHAT = 'CURHAT',
  CODING = 'CODING',
  TANTANGAN = 'TANTANGAN',
  PERINGKAT = 'PERINGKAT',
  KUIS = 'KUIS',
  LENCANA = 'LENCANA',
  PROFIL = 'PROFIL',
}

export enum EducationLevel {
  SD = 'SD',
  SMP = 'SMP',
  SMA = 'SMA',
  SMK = 'SMK',
  UMUM = 'UMUM',
}

export interface BookReference {
  title: string;
  authorOrPublisher: string;
  year: string;
  catalogUrl: string;
  companionBookTitle?: string;
  companionBookUrl?: string;
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

export interface SimulationConfig {
  type:
    | 'RATIO_LAB'
    | 'CIRCUIT_LOGIC'
    | 'NEWTON_FORCE'
    | 'FRACTION_VISUAL'
    | 'CYBER_CIPHER'
    | 'ALGEBRA_BALANCE';
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
  mapel?: string;
  kelas?: string;
  educationLevel: EducationLevel;
  classRange: string;
  xpReward: number;
  estimatedMinutes: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  summaryPoints: string[];
  bookSource: BookReference;
  practiceQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  simulation: SimulationConfig;
}

export interface CodingLessonItem {
  id: string;
  title: string;
  language: 'JavaScript' | 'Python' | 'HTML & CSS' | 'TypeScript & Web API';
  levelTag: string;
  summary: string;
  starterCode: string;
  expectedExplanation: string;
  sampleOutput: string;
  challengePrompt: string;
  xpReward: number;
  bookReference: {
    title: string;
    author: string;
    url: string;
  };
}

export interface CodingResourceBook {
  id: string;
  title: string;
  author: string;
  publisher: string;
  category: string;
  description: string;
  url: string;
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

export interface CurhatJournalEntry {
  id: string;
  mood: string;
  storyText: string;
  mimiWarmReply: string;
  createdAt: string;
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
  studentId?: string;
  photoURL?: string;
  googleLinked?: boolean;
  isDev?: boolean;
  lastNameChange?: number | null;
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
  selectedSubject: string;
  selectedArenaLevel?: string;
  isProfesorMode: boolean;
  studentName: string;
  studentEmail: string;
  studentId?: string;
  studentPhotoUrl?: string;
  isDev?: boolean;
  lastNameChange?: number | null;
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

export interface DuelQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  timeLimitSec: number;
}

export interface DuelPlayer {
  uid: string;
  displayName: string;
  score: number;
  currentQIndex: number;
  isReady: boolean;
  selectedAnswer: number | null;
  hasAnsweredCurrent: boolean;
  streak: number;
}

export interface DuelRoom {
  roomId: string;
  createdAt: number;
  mode: 'bot' | 'pvp';
  status: 'waiting' | 'countdown' | 'in_progress' | 'finished';
  countdown: number;
  host: DuelPlayer;
  guest?: DuelPlayer | null;
  questions: DuelQuestion[];
  currentRound: number;
  totalRounds: number;
  winnerUid?: string | null;
  xpStake: number;
  updatedAt?: any;
}

export interface AiLearningPathStep {
  stepNumber: number;
  title: string;
  description: string;
  keyConcept: string;
  estimatedMinutes: number;
  xpReward: number;
  difficulty: 'Mudah' | 'Menengah' | 'Tantangan' | string;
}

export interface AiLearningPath {
  title: string;
  strategyTip: string;
  estimatedTotalMinutes: number;
  steps: AiLearningPathStep[];
}
