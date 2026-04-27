import { Bell, Flame, Clock, Hash } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../../lib/api';
import { Link } from 'react-router-dom';

export function TopBar() {
  const { user, isGuest } = useAuthStore();

  const { data: meData } = useQuery({
    queryKey: ['user-me'],
    queryFn: () => userApi.getMe(),
    staleTime: 60000,
    retry: false,
    enabled: !isGuest,
  });

  const stats = meData?.data?.data?.stats;
  const streak = meData?.data?.data?.streak;

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-white/8 bg-navy-800/60 backdrop-blur-sm sticky top-0 z-20">
      {/* Left: stats or guest notice */}
      <div className="flex items-center gap-6">
        {isGuest ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400">
              ⚡ Guest Mode
            </span>
            <span className="hidden sm:block text-xs text-slate-500">
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors">Create an account</Link>
              {' '}to save progress &amp; compete
            </span>
          </div>
        ) : (
          <>
            <div className="hidden md:flex items-center gap-1.5 text-sm text-slate-400">
              <Flame size={14} className="text-orange-400" />
              <span className="font-semibold text-white">{streak?.current ?? 0}</span>
              <span>day streak</span>
            </div>
            {stats && (
              <>
                <div className="hidden lg:flex items-center gap-1.5 text-sm text-slate-400">
                  <Hash size={14} className="text-blue-400" />
                  <span className="font-semibold text-white">{stats.totalQuestions.toLocaleString('en-IN')}</span>
                  <span>total</span>
                </div>
                {stats.overallAvgTime && (
                  <div className="hidden lg:flex items-center gap-1.5 text-sm text-slate-400">
                    <Clock size={14} className="text-green-400" />
                    <span className="font-semibold text-white">{stats.overallAvgTime.toFixed(1)}s</span>
                    <span>avg</span>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="btn-ghost p-2 relative">
          <Bell size={16} />
        </button>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{
              background: isGuest
                ? 'linear-gradient(135deg, #F59E0B, #F97316)'
                : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            }}
          >
            {isGuest ? '⚡' : (user?.username?.slice(0, 2).toUpperCase() ?? 'U')}
          </div>
          <span className="hidden sm:block text-sm font-medium text-white">
            {isGuest ? 'Guest' : user?.username}
          </span>
        </div>
      </div>
    </header>
  );
}
