import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Zap, Star } from 'lucide-react';

interface AnswerRevealProps {
  answer: string;
  timeTaken: number;
  bestTime: number | null;
  hint?: string; // For Vedic / squares
}

export function AnswerReveal({ answer, timeTaken, bestTime, hint }: AnswerRevealProps) {
  const isPersonalBest = bestTime === null || timeTaken < bestTime;
  const timeColor = timeTaken < 5 ? 'text-green-400' : timeTaken < 15 ? 'text-yellow-400' : 'text-red-400';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
        className="flex flex-col items-center gap-4 mt-2"
      >
        {/* Answer */}
        <div className="flex items-center gap-3">
          <CheckCircle className="text-green-400 shrink-0" size={28} />
          <span className="answer-reveal text-green-400">{answer}</span>
        </div>

        {/* Time taken */}
        <div className="flex items-center gap-4 text-sm">
          <span className={`flex items-center gap-1.5 font-semibold ${timeColor}`}>
            <Zap size={14} />
            {timeTaken.toFixed(1)}s
          </span>
          {isPersonalBest ? (
            <span className="flex items-center gap-1.5 text-yellow-400 font-semibold">
              <Star size={14} />
              New Best!
            </span>
          ) : bestTime !== null ? (
            <span className="text-slate-400">
              Best: {bestTime.toFixed(1)}s
            </span>
          ) : null}
        </div>

        {/* Vedic / identity hint panel */}
        {hint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="w-full max-w-lg rounded-xl border border-amber-500/20 bg-amber-500/5 p-4"
          >
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-2">
              <span>✨</span>
              <span>Technique / Identity Used</span>
            </div>
            <pre className="text-slate-300 text-xs font-mono whitespace-pre-wrap leading-relaxed">
              {hint}
            </pre>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
