import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BarChart2, Trophy, Settings, LogOut, Clock } from 'lucide-react';
import { MODULES, getModuleInfo } from '@calcura/shared';
import type { ModuleType } from '@calcura/shared';
import { usePracticeStore } from '../../store/practiceStore';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../lib/api';
import toast from 'react-hot-toast';

const MODULE_GROUPS = [
  { label: 'Core', modules: ['ARITHMETIC', 'TABLES', 'SQUARES', 'CUBES', 'POWERS'] as ModuleType[] },
  { label: 'Concepts', modules: ['PERCENTAGES', 'FRACTIONS', 'HCF_LCM', 'AVERAGES', 'BODMAS'] as ModuleType[] },
  { label: 'Advanced', modules: ['SERIES', 'VEDIC', 'APPROXIMATION'] as ModuleType[] },
  { label: 'Test', modules: ['MOCK'] as ModuleType[] },
];

interface SidebarProps {
  moduleAvgTimes?: Record<string, number | null>;
}

export function Sidebar({ moduleAvgTimes = {} }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { activeModule, setActiveModule } = usePracticeStore();
  const { user, clearAuth } = useAuthStore();

  const handleModuleClick = (module: ModuleType) => {
    setActiveModule(module);
    navigate(`/dashboard?module=${module}`);
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore
    }
    clearAuth();
    navigate('/login');
    toast.success('Logged out');
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? 'U';

  return (
    <aside
      className={`flex flex-col h-full border-r border-white/8 bg-navy-800 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      } flex-shrink-0`}
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/8">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-gradient">Calcura</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="btn-ghost p-1.5 ml-auto"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* User avatar */}
      <div className={`flex items-center gap-3 px-4 py-3 border-b border-white/8 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 text-white"
          style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
          {initials}
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-sm font-semibold text-white truncate">{user?.username ?? 'User'}</div>
            <div className="text-xs text-slate-500 truncate">{user?.email ?? ''}</div>
          </div>
        )}
      </div>

      {/* Module list */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-3 px-2">
        {MODULE_GROUPS.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed && (
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-1">
                {group.label}
              </div>
            )}
            {group.modules.map((moduleId) => {
              const info = getModuleInfo(moduleId);
              const isActive = activeModule === moduleId;
              const avgTime = moduleAvgTimes[moduleId];

              return (
                <button
                  key={moduleId}
                  onClick={() => handleModuleClick(moduleId)}
                  className={`sidebar-item w-full text-left ${isActive ? 'active' : ''}`}
                  style={isActive ? { color: info.accent, background: `${info.accent}15` } : {}}
                  title={collapsed ? info.name : undefined}
                >
                  <span
                    className="text-lg shrink-0 w-6 flex items-center justify-center"
                    style={{ color: isActive ? info.accent : undefined }}
                  >
                    {info.icon}
                  </span>
                  {!collapsed && (
                    <div className="flex-1 overflow-hidden">
                      <div className="text-[13px] font-medium truncate">{info.shortName}</div>
                      {avgTime !== null && avgTime !== undefined && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Clock size={9} />
                          {avgTime.toFixed(1)}s avg
                        </div>
                      )}
                    </div>
                  )}
                  {/* Active dot */}
                  {isActive && !collapsed && (
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: info.accent }} />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="border-t border-white/8 px-2 py-2 flex flex-col gap-1">
        <button
          onClick={() => navigate('/dashboard')}
          className={`sidebar-item w-full text-left ${location.pathname === '/dashboard' && !activeModule ? 'active' : ''}`}
          title={collapsed ? 'Analytics' : undefined}
        >
          <BarChart2 size={18} />
          {!collapsed && <span className="text-[13px] font-medium">Analytics</span>}
        </button>
        <button
          onClick={() => navigate('/leaderboard')}
          className="sidebar-item w-full text-left"
          title={collapsed ? 'Leaderboard' : undefined}
        >
          <Trophy size={18} />
          {!collapsed && <span className="text-[13px] font-medium">Leaderboard</span>}
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="sidebar-item w-full text-left"
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings size={18} />
          {!collapsed && <span className="text-[13px] font-medium">Settings</span>}
        </button>
        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/10"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-[13px] font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
