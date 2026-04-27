import { z } from 'zod';
import type { ModuleType, Difficulty } from './types';

// ── Auth Schemas ──────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// ── Session Schemas ───────────────────────────────────────────────────────────

export const startSessionSchema = z.object({
  module: z.enum([
    'ARITHMETIC', 'SQUARES', 'CUBES', 'TABLES', 'PERCENTAGES',
    'FRACTIONS', 'HCF_LCM', 'POWERS', 'SERIES', 'BODMAS',
    'AVERAGES', 'VEDIC', 'APPROXIMATION', 'MOCK',
  ] as [ModuleType, ...ModuleType[]]),
  difficulty: z.enum(['BASIC', 'INTERMEDIATE', 'ADVANCED', 'GENIUS'] as [Difficulty, ...Difficulty[]]),
});

export const endSessionSchema = z.object({
  questionCount: z.number().int().min(0),
  avgTime: z.number().min(0).nullable(),
  bestTime: z.number().min(0).nullable(),
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type EndSessionInput = z.infer<typeof endSessionSchema>;

// ── Question Log Schema ───────────────────────────────────────────────────────

export const logQuestionSchema = z.object({
  sessionId: z.string().min(1),
  module: z.enum([
    'ARITHMETIC', 'SQUARES', 'CUBES', 'TABLES', 'PERCENTAGES',
    'FRACTIONS', 'HCF_LCM', 'POWERS', 'SERIES', 'BODMAS',
    'AVERAGES', 'VEDIC', 'APPROXIMATION', 'MOCK',
  ] as [ModuleType, ...ModuleType[]]),
  difficulty: z.enum(['BASIC', 'INTERMEDIATE', 'ADVANCED', 'GENIUS'] as [Difficulty, ...Difficulty[]]),
  questionText: z.string().min(1).max(1000),
  answer: z.string().min(1).max(500),
  timeTaken: z.number().min(0).max(3600),
  isCorrect: z.boolean().default(true),
});

export type LogQuestionInput = z.infer<typeof logQuestionSchema>;

// ── Mock Result Schema ────────────────────────────────────────────────────────

export const saveMockResultSchema = z.object({
  totalQuestions: z.number().int().min(1),
  correctAnswers: z.number().int().min(0),
  timeLimitSecs: z.number().int().min(0).nullable().optional(),
  avgTime: z.number().min(0),
  breakdown: z.record(
    z.object({
      count: z.number().int().min(0),
      avgTime: z.number().min(0),
      correct: z.number().int().min(0),
    })
  ),
});

export type SaveMockResultInput = z.infer<typeof saveMockResultSchema>;

// ── Profile Update Schema ─────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  country: z.string().max(100).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
