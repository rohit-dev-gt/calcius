import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';

interface TrendPoint {
  date: string;
  avgTime: number;
  count: number;
}

interface TrendChartProps {
  data: TrendPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip">
      <div className="text-slate-400 text-[10px] mb-1">{label}</div>
      <div className="font-bold text-white">{payload[0].value.toFixed(1)}s avg</div>
      <div className="text-slate-500 text-[10px]">{payload[0].payload.count} questions</div>
    </div>
  );
};

export function TrendChart({ data }: TrendChartProps) {
  const avgOfAvgs = data.length > 0
    ? data.reduce((s, d) => s + d.avgTime, 0) / data.length
    : null;

  return (
    <div className="card p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">30-Day Trend</h3>
        {avgOfAvgs && (
          <span className="text-sm text-slate-400">
            Period avg: <span className="text-white font-semibold">{avgOfAvgs.toFixed(1)}s</span>
          </span>
        )}
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-slate-600 text-sm">
          Practice more to see your trend
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false}
              tickFormatter={(v) => v.split('-').slice(1).join('/')}
            />
            <YAxis tick={{ fontSize: 11 }} tickLine={false}
              tickFormatter={(v) => `${v}s`} reversed
            />
            <Tooltip content={<CustomTooltip />} />
            {avgOfAvgs && (
              <ReferenceLine y={avgOfAvgs} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
            )}
            <Line
              type="monotone"
              dataKey="avgTime"
              stroke="#6366F1"
              strokeWidth={2.5}
              dot={{ fill: '#6366F1', r: 3 }}
              activeDot={{ r: 5, fill: '#8B5CF6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
      <p className="text-xs text-slate-600 text-center">Lower is better — Y-axis reversed</p>
    </div>
  );
}
