import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Zap, Users, Crown } from 'lucide-react';
import { leaderboardApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { getRankFromAvgTime, RANK_THRESHOLDS } from '@calcura/shared';
import type { LeaderboardEntry } from '@calcura/shared';

export function LeaderboardPage() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => leaderboardApi.getTop100(),
    staleTime: 300000, // 5 minutes (matches Redis TTL)
    retry: false,
  });

  const { data: myRankData } = useQuery({
    queryKey: ['my-rank'],
    queryFn: () => leaderboardApi.getMyRank(),
    staleTime: 300000,
    retry: false,
  });

  const leaderboard: LeaderboardEntry[] = data?.data?.data ?? [];
  const myRank = myRankData?.data?.data;

  const getRankColor = (rankTier: string) => {
    const info = RANK_THRESHOLDS.find((r) => r.tier === rankTier);
    return info?.color ?? '#94A3B8';
  };

  const getPositionBadge = (pos: number) => {
    if (pos === 1) return <span className="text-yellow-400 text-xl">🥇</span>;
    if (pos === 2) return <span className="text-slate-400 text-xl">🥈</span>;
    if (pos === 3) return <span className="text-amber-600 text-xl">🥉</span>;
    return <span className="text-slate-600 font-mono font-bold text-sm">#{pos}</span>;
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
          <Trophy className="text-yellow-400" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Global Leaderboard</h1>
          <p className="text-slate-400 text-sm">Top 100 by overall average time (min. 10 questions)</p>
        </div>
      </div>

      {/* My rank card */}
      {myRank?.rank && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 flex items-center gap-4"
          style={{ borderColor: '#6366F120', background: 'linear-gradient(135deg, #6366F110, #8B5CF610)' }}
        >
          <Crown className="text-indigo-400 shrink-0" size={20} />
          <div className="flex-1">
            <div className="text-sm text-slate-400">Your global rank</div>
            <div className="text-2xl font-black text-white">#{myRank.rank.toLocaleString('en-IN')}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-white">{myRank.overallAvgTime?.toFixed(1)}s avg</div>
            <div className="text-xs" style={{ color: getRankColor(myRank.rankTier) }}>{myRank.rankTier}</div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard table */}
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-14 skeleton rounded-xl" />
          ))}
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="card p-12 flex flex-col items-center gap-3 text-center">
          <Users className="text-slate-600" size={40} />
          <p className="text-slate-500">No one on the leaderboard yet.</p>
          <p className="text-slate-600 text-sm">Complete 10+ questions to appear here!</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs font-medium uppercase tracking-wider border-b border-white/8 bg-white/3">
                  <th className="text-left py-3 pl-4 pr-3 w-12">Rank</th>
                  <th className="text-left py-3 pr-4">Player</th>
                  <th className="text-left py-3 pr-4">Tier</th>
                  <th className="text-right py-3 pr-4">Questions</th>
                  <th className="text-right py-3 pr-4">Avg Time</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, i) => {
                  const isMe = entry.username === user?.username;
                  return (
                    <motion.tr
                      key={entry.userId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className={`border-b border-white/5 transition-colors ${
                        isMe
                          ? 'bg-indigo-500/10 border-indigo-500/20'
                          : 'hover:bg-white/3'
                      }`}
                    >
                      <td className="py-3 pl-4 pr-3">
                        {getPositionBadge(entry.rank)}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
                          >
                            {entry.username.slice(0, 2).toUpperCase()}
                          </div>
                          <span className={`font-semibold ${isMe ? 'text-indigo-400' : 'text-white'}`}>
                            {entry.username} {isMe && <span className="text-xs text-indigo-500">(you)</span>}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className="rank-badge text-[10px]"
                          style={{ color: getRankColor(entry.rankTier), borderColor: `${getRankColor(entry.rankTier)}30` }}
                        >
                          {RANK_THRESHOLDS.find((r) => r.tier === entry.rankTier)?.emoji} {entry.rankTier}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right text-slate-400">
                        {entry.totalQuestions.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 pr-4 text-right font-bold text-green-400">
                        {entry.overallAvgTime.toFixed(2)}s
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-slate-600">
        Leaderboard updates every 5 minutes. Min. 10 questions required.
      </p>
    </div>
  );
}
