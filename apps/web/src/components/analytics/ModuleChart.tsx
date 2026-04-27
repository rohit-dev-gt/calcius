import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { MODULES } from '@calcura/shared';
import type { ModuleStat, ModuleType } from '@calcura/shared';
import { getModuleInfo } from '@calcura/shared';

interface ModuleChartProps {
  moduleStats: ModuleStat[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="tooltip">
      <div className="font-bold text-white">{data.name}</div>
      <div className="text-slate-400">
        Avg: <span style={{ color: data.color }} className="font-semibold">{data.avgTime?.toFixed(1) ?? '—'}s</span>
      </div>
      <div className="text-slate-500 text-[10px]">{data.total} questions</div>
    </div>
  );
};

export function ModuleChart({ moduleStats }: ModuleChartProps) {
  const navigate = useNavigate();

  // Build chart data for all 14 modules
  const chartData = MODULES.map((mod) => {
    const stat = moduleStats.find((s) => s.module === mod.id);
    return {
      id: mod.id,
      name: mod.shortName,
      avgTime: stat?.avgTime ?? null,
      total: stat?.totalQuestions ?? 0,
      color: mod.accent,
    };
  }).sort((a, b) => (a.avgTime ?? 999) - (b.avgTime ?? 999));

  const getBarColor = (avgTime: number | null) => {
    if (avgTime === null) return 'rgba(255,255,255,0.1)';
    if (avgTime < 5)  return '#22C55E';
    if (avgTime < 10) return '#84CC16';
    if (avgTime < 15) return '#F59E0B';
    if (avgTime < 25) return '#F97316';
    return '#EF4444';
  };

  return (
    <div className="card p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Module Performance</h3>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> &lt;5s fast</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" /> 5–15s</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> &gt;15s slow</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical" barSize={16}
          onClick={(data) => {
            if (data?.activePayload?.[0]) {
              const id = data.activePayload[0].payload.id;
              navigate(`/dashboard?module=${id}`);
            }
          }}
        >
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false}
            label={{ value: 'Avg Time (s)', position: 'insideBottomRight', fontSize: 11, fill: '#64748B' }}
          />
          <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="avgTime" radius={[0, 4, 4, 0]} cursor="pointer">
            {chartData.map((entry) => (
              <Cell key={entry.id} fill={getBarColor(entry.avgTime)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-slate-500 text-center">Click any bar to jump to that module</p>
    </div>
  );
}
