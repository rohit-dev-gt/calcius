import type { ModuleType, RankTier } from './types';

// ── Rank System ───────────────────────────────────────────────────────────────

export const RANK_THRESHOLDS: Array<{
  tier: RankTier;
  minAvg: number;
  maxAvg: number;
  color: string;
  emoji: string;
}> = [
  { tier: 'Calcura Genius', minAvg: 0,    maxAvg: 1.5,  color: '#FFD700', emoji: '🧠' },
  { tier: 'Master',         minAvg: 1.5,  maxAvg: 3,    color: '#C084FC', emoji: '⚡' },
  { tier: 'Expert',         minAvg: 3,    maxAvg: 6,    color: '#38BDF8', emoji: '🎯' },
  { tier: 'Scholar',        minAvg: 6,    maxAvg: 10,   color: '#4ADE80', emoji: '📚' },
  { tier: 'Practitioner',   minAvg: 10,   maxAvg: 15,   color: '#FB923C', emoji: '🔧' },
  { tier: 'Apprentice',     minAvg: 15,   maxAvg: 25,   color: '#94A3B8', emoji: '📖' },
  { tier: 'Novice',         minAvg: 25,   maxAvg: Infinity, color: '#64748B', emoji: '🌱' },
];

export function getRankFromAvgTime(avgTime: number | null): RankTier {
  if (avgTime === null) return 'Novice';
  for (const rank of RANK_THRESHOLDS) {
    if (avgTime >= rank.minAvg && avgTime < rank.maxAvg) return rank.tier;
  }
  return 'Novice';
}

export function getRankProgress(avgTime: number | null): number {
  if (avgTime === null) return 0;
  const currentRankIdx = RANK_THRESHOLDS.findIndex(
    (r) => avgTime >= r.minAvg && avgTime < r.maxAvg
  );
  if (currentRankIdx <= 0) return 100; // Calcura Genius or not found
  const current = RANK_THRESHOLDS[currentRankIdx];
  const next = RANK_THRESHOLDS[currentRankIdx - 1];
  if (current.maxAvg === Infinity) return 0;
  const range = current.maxAvg - next.maxAvg;
  const progress = current.maxAvg - avgTime;
  return Math.min(100, Math.max(0, (progress / range) * 100));
}

// ── Module Metadata ───────────────────────────────────────────────────────────

export interface ModuleInfo {
  id: ModuleType;
  name: string;
  shortName: string;
  description: string;
  accent: string;
  icon: string;
  group: 'core' | 'concepts' | 'advanced' | 'test';
}

export const MODULES: ModuleInfo[] = [
  // Core
  {
    id: 'ARITHMETIC',    name: 'Arithmetic',              shortName: 'Arithmetic',
    description: 'Addition, subtraction, multiplication, and division at speed',
    accent: '#F97316', icon: '➕', group: 'core',
  },
  {
    id: 'TABLES',        name: 'Multiplication Tables',   shortName: 'Tables',
    description: 'Master tables from 2 to 99',
    accent: '#3B82F6', icon: '✖️', group: 'core',
  },
  {
    id: 'SQUARES',       name: 'Squares & Square Roots',  shortName: 'Squares',
    description: 'Calculate squares and square roots instantly',
    accent: '#8B5CF6', icon: '²', group: 'core',
  },
  {
    id: 'CUBES',         name: 'Cubes & Cube Roots',      shortName: 'Cubes',
    description: 'Master cubes and cube roots from 1 to 50',
    accent: '#14B8A6', icon: '³', group: 'core',
  },
  {
    id: 'POWERS',        name: 'Powers & Exponents',      shortName: 'Powers',
    description: 'Powers of 2, 3, 5 and exponent rules',
    accent: '#EF4444', icon: 'xⁿ', group: 'core',
  },
  // Concepts
  {
    id: 'PERCENTAGES',   name: 'Percentages',             shortName: 'Percentages',
    description: 'Percentage calculations, changes, and chain discounts',
    accent: '#22C55E', icon: '%', group: 'concepts',
  },
  {
    id: 'FRACTIONS',     name: 'Fractions & Decimals',    shortName: 'Fractions',
    description: 'Simplify, compare, convert, and operate on fractions',
    accent: '#EC4899', icon: '½', group: 'concepts',
  },
  {
    id: 'HCF_LCM',       name: 'HCF & LCM',               shortName: 'HCF/LCM',
    description: 'Highest common factor and least common multiple',
    accent: '#F59E0B', icon: '∩', group: 'concepts',
  },
  {
    id: 'AVERAGES',      name: 'Averages & Ratios',        shortName: 'Averages',
    description: 'Averages, weighted means, ratios, and proportions',
    accent: '#F43F5E', icon: 'x̄', group: 'concepts',
  },
  {
    id: 'BODMAS',        name: 'Simplification (BODMAS)',  shortName: 'BODMAS',
    description: 'SSC-style BODMAS simplification questions',
    accent: '#84CC16', icon: '{ }', group: 'concepts',
  },
  // Advanced
  {
    id: 'SERIES',        name: 'Number Series & Patterns', shortName: 'Series',
    description: 'AP, GP, Fibonacci-type, and pattern recognition',
    accent: '#06B6D4', icon: '…', group: 'advanced',
  },
  {
    id: 'VEDIC',         name: 'Vedic Mathematics',        shortName: 'Vedic Math',
    description: 'Ancient sutras for lightning-fast mental calculations',
    accent: '#EAB308', icon: '☯', group: 'advanced',
  },
  {
    id: 'APPROXIMATION', name: 'Approximation & Estimation', shortName: 'Approximation',
    description: 'SSC/IBPS-style MCQ approximation questions',
    accent: '#7C3AED', icon: '≈', group: 'advanced',
  },
  // Test
  {
    id: 'MOCK',          name: 'Mock Speed Test',           shortName: 'Mock Test',
    description: 'Timed mock exam mixing all 13 modules',
    accent: '#F8FAFC', icon: '⏱', group: 'test',
  },
];

export const MODULE_MAP = new Map(MODULES.map((m) => [m.id, m]));

export function getModuleInfo(id: ModuleType): ModuleInfo {
  return MODULE_MAP.get(id) ?? MODULES[0];
}

// ── Difficulty Labels ─────────────────────────────────────────────────────────

export const DIFFICULTY_LABELS = {
  BASIC: 'Basic',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  GENIUS: 'Genius',
} as const;

// ── App Constants ─────────────────────────────────────────────────────────────

export const APP_NAME = 'Calcura';
export const APP_TAGLINE = 'Train your mind. Master the numbers.';
export const API_VERSION = 'v1';
export const LEADERBOARD_CACHE_TTL_SECONDS = 300; // 5 minutes
export const REFRESH_TOKEN_COOKIE_NAME = 'calcura_refresh_token';
