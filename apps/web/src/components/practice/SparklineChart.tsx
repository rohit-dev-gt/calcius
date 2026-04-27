import { usePracticeStore } from '../../store/practiceStore';

export function SparklineChart() {
  const { sessionQuestions } = usePracticeStore();
  const last10 = sessionQuestions.slice(-10);

  if (last10.length === 0) {
    return (
      <div className="flex items-center justify-center h-12 text-slate-600 text-xs">
        Your last 10 times will appear here
      </div>
    );
  }

  const maxTime = Math.max(...last10.map((q) => q.timeTaken), 1);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-end gap-1 h-12">
        {last10.map((q, i) => {
          const heightPct = Math.max(10, (q.timeTaken / maxTime) * 100);
          const colorClass =
            q.timeTaken < 5 ? 'bg-green-400' :
            q.timeTaken < 15 ? 'bg-orange-400' : 'bg-red-400';

          return (
            <div
              key={i}
              className="group relative flex-1 flex flex-col justify-end"
              style={{ height: '100%' }}
            >
              <div
                className={`${colorClass} rounded-t opacity-70 group-hover:opacity-100 transition-all duration-300`}
                style={{ height: `${heightPct}%` }}
              />
              {/* Tooltip */}
              <div className="tooltip -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                {q.timeTaken.toFixed(1)}s
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-slate-600 text-[10px]">
        <span>-{Math.min(last10.length, 10)}</span>
        <span className="text-slate-500 font-medium">Last {last10.length} questions</span>
        <span>now</span>
      </div>
    </div>
  );
}
