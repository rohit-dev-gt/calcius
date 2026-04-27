import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface HeatmapEntry {
  date: string;
  count: number;
}

interface ActivityHeatmapProps {
  data: HeatmapEntry[];
}

function getDaysArray(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  return days;
}

function getColor(count: number): string {
  if (count === 0) return 'rgba(255,255,255,0.04)';
  if (count < 5)  return '#1E3A2F';
  if (count < 15) return '#22C55E60';
  if (count < 30) return '#22C55E99';
  return '#22C55E';
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  const dataMap = new Map(data.map((d) => [d.date, d.count]));
  const days = getDaysArray();

  // Build 52 weeks × 7 days grid
  const firstDow = days[0].getDay(); // 0=Sun
  const paddedDays: (Date | null)[] = [...Array(firstDow).fill(null), ...days];
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  // Month labels
  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, col) => {
    const day = week.find((d) => d !== null);
    if (day && day.getMonth() !== lastMonth) {
      monthLabels.push({ label: MONTHS[day.getMonth()], col });
      lastMonth = day.getMonth();
    }
  });

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="card p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Practice Activity</h3>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Less</span>
          {[0, 5, 15, 30, 50].map((c) => (
            <div
              key={c}
              className="w-3 h-3 rounded-sm"
              style={{ background: getColor(c) }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <div className="relative" style={{ minWidth: weeks.length * 15 }}>
          {/* Month labels */}
          <div className="flex gap-px mb-1 ml-7" style={{ paddingLeft: 0 }}>
            {weeks.map((_, col) => {
              const label = monthLabels.find((m) => m.col === col);
              return (
                <div key={col} className="text-[9px] text-slate-600 font-medium" style={{ width: 13 }}>
                  {label?.label ?? ''}
                </div>
              );
            })}
          </div>

          {/* Grid */}
          <div className="flex gap-px ml-7">
            {weeks.map((week, col) => (
              <div key={col} className="flex flex-col gap-px">
                {week.map((day, row) => {
                  if (!day) return <div key={row} className="w-3 h-3" />;
                  const dateStr = day.toISOString().split('T')[0];
                  const count = dataMap.get(dateStr) ?? 0;
                  return (
                    <div
                      key={row}
                      className="w-3 h-3 rounded-sm cursor-pointer transition-transform hover:scale-125"
                      style={{ background: getColor(count) }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({ date: dateStr, count, x: rect.left, y: rect.top });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-2.5 py-1.5 rounded-lg text-xs font-medium pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y - 36,
            background: '#0B0F1A',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'white',
          }}
        >
          {tooltip.date}: {tooltip.count} question{tooltip.count !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
