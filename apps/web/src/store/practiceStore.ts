import { create } from 'zustand';
import type { ModuleType, Difficulty } from '@calcura/shared';
import type { GeneratedQuestion } from '../modules/generators';

export interface SessionQuestion extends GeneratedQuestion {
  timeTaken: number;
  practicedAt: Date;
  module?: ModuleType;
}

interface PracticeState {
  // Active module & difficulty
  activeModule: ModuleType | null;
  difficulty: Difficulty;

  // Current session
  sessionId: string | null;
  sessionQuestions: SessionQuestion[];
  sessionStartTime: Date | null;

  // Current question
  currentQuestion: (GeneratedQuestion & { module?: ModuleType }) | null;
  timerRunning: boolean;
  timerStartMs: number;
  elapsedMs: number;
  showAnswer: boolean;

  // Actions
  setActiveModule: (module: ModuleType) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setSessionId: (id: string | null) => void;
  setCurrentQuestion: (q: GeneratedQuestion & { module?: ModuleType }) => void;
  startTimer: () => void;
  stopTimer: () => number; // returns elapsed seconds
  setElapsed: (ms: number) => void;
  revealAnswer: () => void;
  recordQuestion: (timeTaken: number) => void;
  resetForNext: () => void;
  resetSession: () => void;
}

export const usePracticeStore = create<PracticeState>((set, get) => ({
  activeModule: null,
  difficulty: 'BASIC',
  sessionId: null,
  sessionQuestions: [],
  sessionStartTime: null,
  currentQuestion: null,
  timerRunning: false,
  timerStartMs: 0,
  elapsedMs: 0,
  showAnswer: false,

  setActiveModule: (module) =>
    set({ activeModule: module, sessionQuestions: [], sessionId: null }),

  setDifficulty: (difficulty) =>
    set({ difficulty, sessionQuestions: [] }),

  setSessionId: (id) =>
    set({ sessionId: id, sessionStartTime: id ? new Date() : null }),

  setCurrentQuestion: (q) =>
    set({ currentQuestion: q, showAnswer: false, timerRunning: false, elapsedMs: 0 }),

  startTimer: () =>
    set({ timerRunning: true, timerStartMs: performance.now(), elapsedMs: 0 }),

  stopTimer: () => {
    const { timerStartMs } = get();
    const elapsed = performance.now() - timerStartMs;
    set({ timerRunning: false, elapsedMs: elapsed });
    return Math.round(elapsed / 100) / 10; // seconds with 1 decimal
  },

  setElapsed: (ms) => set({ elapsedMs: ms }),

  revealAnswer: () => set({ showAnswer: true }),

  recordQuestion: (timeTaken) => {
    const { currentQuestion, sessionQuestions } = get();
    if (!currentQuestion) return;
    const record: SessionQuestion = {
      ...currentQuestion,
      timeTaken,
      practicedAt: new Date(),
    };
    set({ sessionQuestions: [...sessionQuestions, record] });
  },

  resetForNext: () =>
    set({ showAnswer: false, timerRunning: false, elapsedMs: 0, currentQuestion: null }),

  resetSession: () =>
    set({
      sessionId: null,
      sessionQuestions: [],
      sessionStartTime: null,
      currentQuestion: null,
      timerRunning: false,
      elapsedMs: 0,
      showAnswer: false,
    }),
}));

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectSessionAvgTime = (state: PracticeState): number | null => {
  const { sessionQuestions } = state;
  if (sessionQuestions.length === 0) return null;
  return sessionQuestions.reduce((s, q) => s + q.timeTaken, 0) / sessionQuestions.length;
};

export const selectSessionBestTime = (state: PracticeState): number | null => {
  const { sessionQuestions } = state;
  if (sessionQuestions.length === 0) return null;
  return Math.min(...sessionQuestions.map((q) => q.timeTaken));
};
