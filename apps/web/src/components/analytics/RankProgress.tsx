import { motion } from 'framer-motion';
import { RANK_THRESHOLDS, getRankFromAvgTime, getRankProgress } from '@calcura/shared';
import type { RankTier } from '@calcura/shared';

interface RankProgressProps {
  overallAvgTime: number | null;
  totalQuestions: number;
}

export function RankProgress({ overallAvgTime, totalQuestions }: RankProgressProps) {
  const currentRank = getRankFromAvgTime(overallAvgTime);
  const progress = getRankProgress(overallAvgTime);
  const currentTierInfo = RANK_THRESHOLDS.find((r) => r.tier === currentRank)!;
  const currentIdx = RANK_THRESHOLDS.findIndex((r) => r.tier === currentRank);
  const nextTier = currentIdx > 0 ? RANK_THRESHOLDS[currentIdx - 1] : null;

  return (
    <div className="card p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Rank Progress</h3>
        {totalQuestions < 10 && (
          <span className="text-xs text-slate-500">Complete {10 - totalQuestions} more questions to rank</span>
        )}
      </div>

      {/* Current rank badge */}
      <div className="flex items-center gap-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4 }}
          className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center shrink-0"
          style={{ background: `${currentTierInfo.color}20`, border: `2px solid ${currentTierInfo.color}40` }}
        >
          <span className="text-3xl">{currentTierInfo.emoji}</span>
        </motion.div>
        <div>
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">Current Rank</div>
          <div className="text-2xl font-black" style={{ color: currentTierInfo.color }}>
            {currentRank}
          </div>
          {overallAvgTime && (
            <div className="text-sm text-slate-400 mt-0.5">
              {overallAvgTime.toFixed(1)}s avg per question
            </div>
          )}
        </div>
      </div>

      {/* Progress to next rank */}
      {nextTier && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs font-medium">
            <span style={{ color: currentTierInfo.color }}>{currentRank}</span>
            <span style={{ color: nextTier.color }}>{nextTier.tier}</span>
          </div>
          <div className="progress-bar h-3">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{
                background: `linear-gradient(90deg, ${currentTierInfo.color}, ${nextTier.color})`,
              }}
            />
          </div>
          <div className="text-xs text-slate-500 text-center">
            Reach &lt;{nextTier.maxAvg}s avg to become <span style={{ color: nextTier.color }}>{nextTier.tier}</span>
          </div>
        </div>
      )}

      {/* All 7 ranks timeline */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
        {[...RANK_THRESHOLDS].reverse().map((rank, i) => {
          const isPast = RANK_THRESHOLDS.findIndex((r) => r.tier === currentRank) >
            RANK_THRESHOLDS.findIndex((r) => r.tier === rank.tier);
          const isCurrent = rank.tier === currentRank;
          return (
            <div key={rank.tier} className="flex items-center gap-1 shrink-0">
              <div className="flex flex-col items-center gap-1">
                <span className={`text-base ${isCurrent ? '' : isPast ? 'opacity-100' : 'opacity-30'}`}>
                  {rank.emoji}
                </span>
                <span
                  className={`text-[9px] font-bold text-center leading-tight max-w-[50px] ${isCurrent ? '' : 'text-slate-600'}`}
                  style={isCurrent || isPast ? { color: rank.color } : {}}
                >
                  {rank.tier.split(' ')[0]}
                </span>
              </div>
              {i < RANK_THRESHOLDS.length - 1 && (
                <div className="h-px w-5 bg-white/10" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
