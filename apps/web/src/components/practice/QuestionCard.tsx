import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Eye, ArrowRight } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { usePracticeStore } from '../../store/practiceStore';
import { generateFromModule } from '../../modules/generators';
import type { GeneratedQuestion } from '../../modules/generators';
import { Timer } from './Timer';
import { AnswerReveal } from './AnswerReveal';
import { SessionStats } from './SessionStats';
import { SparklineChart } from './SparklineChart';
import { questionsApi } from '../../lib/api';
import type { ModuleType, Difficulty } from '@calcura/shared';

interface QuestionCardProps {
  module: ModuleType;
  difficulty: Difficulty;
  accentColor: string;
  sessionBestTime: number | null;
}

export function QuestionCard({ module, difficulty, accentColor, sessionBestTime }: QuestionCardProps) {
  const {
    showAnswer, timerRunning,
    startTimer, stopTimer, revealAnswer, recordQuestion, resetForNext, sessionId,
  } = usePracticeStore();

  // ── Local question state (no Zustand dependency for display) ───────────────
  const [question, setQuestion] = useState<GeneratedQuestion>(() =>
    generateFromModule(module, difficulty)
  );
  const [lastTimeTaken, setLastTimeTaken] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const logMutation = useMutation({
    mutationFn: questionsApi.log,
    onError: () => {
      console.warn('Failed to sync question to backend');
    },
  });

  const loadNextQuestion = useCallback(() => {
    const q = generateFromModule(module, difficulty);
    setQuestion(q);
    setLastTimeTaken(null);
    setSelectedOption(null);
    resetForNext();
  }, [module, difficulty, resetForNext]);

  // ── Reload on module / difficulty change ───────────────────────────────────
  const prevKey = useRef(`${module}-${difficulty}`);
  useEffect(() => {
    const key = `${module}-${difficulty}`;
    if (prevKey.current !== key) {
      prevKey.current = key;
      loadNextQuestion();
    }
  }, [module, difficulty, loadNextQuestion]);


  const handleStart = () => {
    if (timerRunning) return;
    startTimer();
  };

  const handleShowAnswer = () => {
    if (!timerRunning && !showAnswer) return;
    const timeTaken = stopTimer();
    setLastTimeTaken(timeTaken);
    revealAnswer();
    recordQuestion(timeTaken);

    // Sync to backend
    if (sessionId) {
      logMutation.mutate({
        sessionId,
        module,
        difficulty,
        questionText: question.text,
        answer: question.answer,
        timeTaken,
        isCorrect: true,
      });
    }
  };

  const handleOptionSelect = (idx: number) => {
    if (showAnswer) return;
    setSelectedOption(idx);
    if (!timerRunning) startTimer();
    setTimeout(() => {
      const timeTaken = stopTimer();
      setLastTimeTaken(timeTaken);
      revealAnswer();
      recordQuestion(timeTaken);

      if (sessionId) {
        logMutation.mutate({
          sessionId, module, difficulty,
          questionText: question.text,
          answer: question.answer,
          timeTaken,
          isCorrect: idx === question.correctOptionIndex,
        });
      }
    }, 200);
  };

  const isApproximation = module === 'APPROXIMATION';

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      {/* Session stats */}
      <SessionStats />

      {/* Question card */}
      <motion.div
        key={question.text}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
        className="card p-8 flex flex-col items-center gap-6"
        style={{ borderColor: `${accentColor}20` }}
      >
        {/* Operation badge */}
        {question.operationType && (
          <span
            className="module-badge text-xs font-bold uppercase tracking-widest"
            style={{ color: accentColor, background: `${accentColor}15` }}
          >
            {question.operationType}
          </span>
        )}

        {/* Question text */}
        <div className="question-text text-center w-full">
          {question.text}
        </div>

        {/* MCQ Options (Approximation) */}
        {isApproximation && question.options && !showAnswer && (
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {question.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                disabled={showAnswer}
                className={`py-3 rounded-xl font-bold text-lg transition-all duration-200 border ${
                  selectedOption === idx
                    ? idx === question.correctOptionIndex
                      ? 'border-green-500 bg-green-500/20 text-green-400'
                      : 'border-red-500 bg-red-500/20 text-red-400'
                    : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Timer */}
        <div className="flex flex-col items-center gap-2">
          <Timer />
          {timerRunning && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              Recording...
            </div>
          )}
        </div>

        {/* Action buttons */}
        {!showAnswer ? (
          <div className="flex gap-3">
            {!timerRunning && !isApproximation && (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}CC, ${accentColor})`,
                  boxShadow: `0 4px 20px ${accentColor}40`,
                  color: 'white',
                }}
              >
                <Play size={18} fill="currentColor" />
                START TIMER
              </button>
            )}
            {timerRunning && !isApproximation && (
              <button
                onClick={handleShowAnswer}
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all duration-200 active:scale-95"
              >
                <Eye size={18} />
                SHOW ANSWER
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Answer reveal */}
            {lastTimeTaken !== null && (
              <AnswerReveal
                answer={question.answer}
                timeTaken={lastTimeTaken}
                bestTime={sessionBestTime}
                hint={question.hint}
              />
            )}

            {/* Next button */}
            <button
              onClick={loadNextQuestion}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/15 border border-white/15 text-white transition-all duration-200 active:scale-95 mt-2"
            >
              NEXT QUESTION
              <ArrowRight size={16} />
            </button>
          </>
        )}
      </motion.div>

      {/* Sparkline */}
      <div className="card p-4">
        <div className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wider">Session Timeline</div>
        <SparklineChart />
      </div>
    </div>
  );
}

