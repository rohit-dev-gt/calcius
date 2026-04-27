import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { usePracticeStore, selectSessionBestTime } from '../../store/practiceStore';
import { QuestionCard } from './QuestionCard';
import { getModuleInfo } from '@calcura/shared';
import { sessionsApi } from '../../lib/api';
import type { ModuleType, Difficulty } from '@calcura/shared';
import { useAuthStore } from '../../store/authStore';

const DIFFICULTIES: Difficulty[] = ['BASIC', 'INTERMEDIATE', 'ADVANCED', 'GENIUS'];

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  BASIC:        '#22C55E',
  INTERMEDIATE: '#F59E0B',
  ADVANCED:     '#EF4444',
  GENIUS:       '#8B5CF6',
};

interface PracticeInterfaceProps {
  module: ModuleType;
}

export function PracticeInterface({ module }: PracticeInterfaceProps) {
  const { difficulty, setDifficulty, setSessionId, resetSession, sessionId } = usePracticeStore();
  const sessionBestTime = usePracticeStore(selectSessionBestTime);
  const { isAuthenticated, isGuest } = useAuthStore();
  const moduleInfo = getModuleInfo(module);

  const startSessionMutation = useMutation({
    mutationFn: sessionsApi.start,
    onSuccess: (res) => {
      setSessionId(res.data.data.id);
    },
    onError: () => {
      // Non-fatal — practice still works without session ID
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) =>
      sessionsApi.end(id, data),
  });

  // Start a new session when module or difficulty changes
  useEffect(() => {
    resetSession();
    if (isAuthenticated && !isGuest) {
      startSessionMutation.mutate({ module, difficulty });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module, difficulty, isAuthenticated, isGuest]);

  // End session on unmount
  useEffect(() => {
    return () => {
      if (sessionId && isAuthenticated && !isGuest) {
        endSessionMutation.mutate({
          id: sessionId,
          data: { questionCount: 0, avgTime: null, bestTime: null },
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <span
            className="text-3xl w-12 h-12 flex items-center justify-center rounded-xl font-bold"
            style={{ background: `${moduleInfo.accent}20`, color: moduleInfo.accent }}
          >
            {moduleInfo.icon}
          </span>
          <div>
            <h1 className="text-xl font-bold text-white">{moduleInfo.name}</h1>
            <p className="text-slate-400 text-sm">{moduleInfo.description}</p>
          </div>
        </div>

        {/* Difficulty tabs */}
        <div className="flex gap-1 sm:ml-auto bg-white/5 rounded-xl p-1">
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficulty(diff)}
              className={`diff-tab ${difficulty === diff ? 'active' : ''}`}
              style={difficulty === diff ? { color: DIFFICULTY_COLORS[diff] } : {}}
            >
              {diff.charAt(0) + diff.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Question Card */}
      <QuestionCard
        module={module}
        difficulty={difficulty}
        accentColor={moduleInfo.accent}
        sessionBestTime={sessionBestTime}
      />
    </div>
  );
}
