import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import type { ModuleStat } from '@calcura/shared';
import type { ModuleType } from '@calcura/shared';

export function DashboardLayout() {
  const { isAuthenticated, isGuest } = useAuthStore();

  // Fetch module stats for sidebar avg times (only for logged-in users)
  const { data: statsData } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => userApi.getStats(),
    staleTime: 30000,
    enabled: isAuthenticated && !isGuest,
    retry: false,
  });

  // Build module → avg time map
  const moduleAvgTimes: Record<string, number | null> = {};
  if (statsData?.data?.data?.moduleStats) {
    const stats: ModuleStat[] = statsData.data.data.moduleStats;
    for (const stat of stats) {
      const key = stat.module as string;
      if (!moduleAvgTimes[key] || (stat.avgTime !== null && stat.avgTime < moduleAvgTimes[key]!)) {
        moduleAvgTimes[key] = stat.avgTime;
      }
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-navy-900">
      {/* Sidebar */}
      <Sidebar moduleAvgTimes={moduleAvgTimes} />

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
