import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Zap, Target, Flame, Globe, TrendingDown } from 'lucide-react';
import { userApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { RankProgress } from '../components/analytics/RankProgress';
import { ModuleChart } from '../components/analytics/ModuleChart';
import { ActivityHeatmap } from '../components/analytics/ActivityHeatmap';
import { TrendChart } from '../components/analytics/TrendChart';
import { getRankFromAvgTime } from '@calcura/shared';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
  delay?: number;
}

function StatCard({ icon, label, value, sub, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="stat-card"
      style={{ borderColor: `${color}20` }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, color }}
        >
          {icon}
        </div>
      </div>
      <div className="text-3xl font-black text-white mt-2">{value}</div>
      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</div>
      {sub && <div className="text-xs text-slate-600">{sub}</div>}
    </motion.div>
  );
}

export function DashboardPage() {
  const { isAuthenticated, isGuest } = useAuthStore();

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => userApi.getStats(),
    staleTime: 30000,
    enabled: isAuthenticated && !isGuest,
    retry: false,
  });

  const { data: heatmapData } = useQuery({
    queryKey: ['user-heatmap'],
    queryFn: () => userApi.getHeatmap(),
    staleTime: 60000,
    enabled: isAuthenticated && !isGuest,
    retry: false,
  });

  const { data: meData } = useQuery({
    queryKey: ['user-me'],
    queryFn: () => userApi.getMe(),
    staleTime: 60000,
    enabled: isAuthenticated && !isGuest,
    retry: false,
  });

  const stats = statsData?.data?.data;
  const me = meData?.data?.data;
  const heatmap = heatmapData?.data?.data ?? [];

  // Demo data for unauthenticated / new users
  const totalQuestions = me?.stats?.totalQuestions ?? 0;
  const overallAvgTime = me?.stats?.overallAvgTime ?? null;
  const globalRank = me?.stats?.globalRank ?? null;
  const streakCurrent = me?.streak?.current ?? 0;

  if (statsLoading && !isGuest) {
    return (
      <div className="flex flex-col gap-6">
        {/* Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0,1,2,3].map((i) => (
            <div key={i} className="h-32 skeleton rounded-2xl" />
          ))}
        </div>
        <div className="h-48 skeleton rounded-2xl" />
        <div className="h-64 skeleton rounded-2xl" />
      </div>
    );
  }

  // ── Guest Dashboard ────────────────────────────────────────────────────────
  if (isGuest) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 flex flex-col items-center gap-4 text-center"
          style={{ borderColor: '#6366F130', background: 'linear-gradient(135deg, #6366F108, #8B5CF608)' }}
        >
          <span className="text-5xl">⚡</span>
          <h1 className="text-2xl font-black text-white">Welcome to Calcura!</h1>
          <p className="text-slate-400 max-w-md">
            You're in <span className="text-amber-400 font-semibold">Guest Mode</span>. All 14 practice modules are available — pick one from the sidebar and start training!
          </p>
        </motion.div>

        {/* Quick-start module cards */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Start</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { id: 'ARITHMETIC', icon: '➕', name: 'Arithmetic', color: '#F97316' },
              { id: 'TABLES', icon: '✖️', name: 'Tables', color: '#3B82F6' },
              { id: 'SQUARES', icon: '²', name: 'Squares', color: '#8B5CF6' },
              { id: 'PERCENTAGES', icon: '%', name: 'Percentages', color: '#22C55E' },
              { id: 'SERIES', icon: '…', name: 'Series', color: '#06B6D4' },
              { id: 'BODMAS', icon: '÷', name: 'BODMAS', color: '#84CC16' },
            ].map((mod) => (
              <motion.a
                key={mod.id}
                href={`/dashboard?module=${mod.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.03 }}
                className="card p-4 flex flex-col items-center gap-2 cursor-pointer text-center no-underline"
                style={{ borderColor: `${mod.color}25` }}
              >
                <span className="text-3xl font-black" style={{ color: mod.color }}>{mod.icon}</span>
                <span className="text-sm font-semibold text-white">{mod.name}</span>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Sign up CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card p-6 flex flex-col sm:flex-row items-center gap-4"
          style={{ borderColor: '#F59E0B30' }}
        >
          <div className="flex-1">
            <h3 className="text-white font-bold mb-1">Save your progress</h3>
            <p className="text-slate-400 text-sm">Create a free account to track your rank, streak, activity heatmap, and compete globally.</p>
          </div>
          <a
            href="/register"
            className="btn-primary shrink-0"
          >
            Create Free Account
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Hero stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Zap size={20} />}
          label="Total Questions"
          value={totalQuestions.toLocaleString('en-IN')}
          color="#6366F1"
          delay={0}
        />
        <StatCard
          icon={<TrendingDown size={20} />}
          label="Overall Avg Time"
          value={overallAvgTime ? `${overallAvgTime.toFixed(1)}s` : '—'}
          sub="lower is better"
          color="#22C55E"
          delay={0.1}
        />
        <StatCard
          icon={<Flame size={20} />}
          label="Current Streak"
          value={`${streakCurrent} day${streakCurrent !== 1 ? 's' : ''}`}
          sub={me?.streak?.longest ? `Best: ${me.streak.longest}d` : undefined}
          color="#F97316"
          delay={0.2}
        />
        <StatCard
          icon={<Globe size={20} />}
          label="Global Rank"
          value={globalRank ? `#${globalRank.toLocaleString('en-IN')}` : '—'}
          sub={totalQuestions < 10 ? 'Need 10+ questions' : undefined}
          color="#F59E0B"
          delay={0.3}
        />
      </div>

      {/* Rank progress */}
      <RankProgress
        overallAvgTime={overallAvgTime}
        totalQuestions={totalQuestions}
      />

      {/* Module chart */}
      <ModuleChart moduleStats={stats?.moduleStats ?? []} />

      {/* Heatmap */}
      <ActivityHeatmap data={heatmap} />

      {/* Trend */}
      <TrendChart data={stats?.trend ?? []} />

      {/* Sessions table */}
      {stats?.recentSessions && stats.recentSessions.length > 0 && (
        <div className="card p-6">
          <h3 className="text-base font-semibold text-white mb-4">Recent Sessions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs font-medium uppercase tracking-wider border-b border-white/8">
                  <th className="text-left pb-3 pr-4">Date</th>
                  <th className="text-left pb-3 pr-4">Module</th>
                  <th className="text-left pb-3 pr-4">Difficulty</th>
                  <th className="text-right pb-3 pr-4">Questions</th>
                  <th className="text-right pb-3 pr-4">Avg Time</th>
                  <th className="text-right pb-3">Best</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSessions.slice(0, 10).map((session: any) => (
                  <tr key={session.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 pr-4 text-slate-400">
                      {new Date(session.startedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="py-3 pr-4 text-white font-medium">{session.module}</td>
                    <td className="py-3 pr-4">
                      <span className="text-slate-400 capitalize">{session.difficulty.toLowerCase()}</span>
                    </td>
                    <td className="py-3 pr-4 text-right text-white">{session.questionCount}</td>
                    <td className="py-3 pr-4 text-right text-orange-400">
                      {session.avgTime ? `${session.avgTime.toFixed(1)}s` : '—'}
                    </td>
                    <td className="py-3 text-right text-green-400">
                      {session.bestTime ? `${session.bestTime.toFixed(1)}s` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalQuestions === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-12 flex flex-col items-center gap-4 text-center"
        >
          <span className="text-6xl">🎯</span>
          <h2 className="text-xl font-bold text-white">Start Practicing!</h2>
          <p className="text-slate-400 max-w-md">
            Choose any module from the sidebar to begin. Your stats, streak, and rank will appear here as you practice.
          </p>
        </motion.div>
      )}
    </div>
  );
}

