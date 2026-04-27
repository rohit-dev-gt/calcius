// ─────────────────────────────────────────────────────────────────────────────
// Shared Types for Calcura — used by both frontend and backend
// ─────────────────────────────────────────────────────────────────────────────

export type ModuleType =
  | 'ARITHMETIC'
  | 'SQUARES'
  | 'CUBES'
  | 'TABLES'
  | 'PERCENTAGES'
  | 'FRACTIONS'
  | 'HCF_LCM'
  | 'POWERS'
  | 'SERIES'
  | 'BODMAS'
  | 'AVERAGES'
  | 'VEDIC'
  | 'APPROXIMATION'
  | 'MOCK';

export type Difficulty = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'GENIUS';

export type RankTier =
  | 'Novice'
  | 'Apprentice'
  | 'Practitioner'
  | 'Scholar'
  | 'Expert'
  | 'Master'
  | 'Calcura Genius';

// ── User ──────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
  country?: string | null;
  createdAt: string;
  lastLoginAt?: string | null;
}

export interface UserProfile extends User {
  stats: UserStats;
  streak: StreakInfo;
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export interface UserStats {
  totalQuestions: number;
  overallAvgTime: number | null;
  globalRank: number | null;
  rank: RankTier;
  rankProgress: number; // 0–100 percentage to next rank
}

export interface StreakInfo {
  current: number;
  longest: number;
  lastDate: string | null;
}

export interface ModuleStat {
  module: ModuleType;
  difficulty: Difficulty;
  totalQuestions: number;
  avgTime: number | null;
  bestTime: number | null;
  lastPracticedAt: string | null;
}

// ── Session ───────────────────────────────────────────────────────────────────

export interface Session {
  id: string;
  userId: string;
  module: ModuleType;
  difficulty: Difficulty;
  startedAt: string;
  endedAt?: string | null;
  questionCount: number;
  avgTime?: number | null;
  bestTime?: number | null;
}

// ── Question Log ──────────────────────────────────────────────────────────────

export interface QuestionLog {
  id: string;
  userId: string;
  sessionId: string;
  module: ModuleType;
  difficulty: Difficulty;
  questionText: string;
  answer: string;
  timeTaken: number;
  isCorrect: boolean;
  practicedAt: string;
}

// ── Mock Result ───────────────────────────────────────────────────────────────

export interface MockResult {
  id: string;
  userId: string;
  totalQuestions: number;
  correctAnswers: number;
  timeLimitSecs?: number | null;
  avgTime: number;
  completedAt: string;
  breakdown: Record<string, { count: number; avgTime: number; correct: number }>;
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string | null;
  country?: string | null;
  totalQuestions: number;
  overallAvgTime: number;
  rankTier: RankTier;
}

// ── Heatmap ───────────────────────────────────────────────────────────────────

export interface HeatmapEntry {
  date: string; // YYYY-MM-DD
  count: number;
}

// ── API Responses ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
