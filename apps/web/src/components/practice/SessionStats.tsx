import { usePracticeStore, selectSessionAvgTime, selectSessionBestTime } from '../../store/practiceStore';

interface SessionStatsProps {
  className?: string;
}

export function SessionStats({ className = '' }: SessionStatsProps) {
  const { sessionQuestions } = usePracticeStore();
  const avgTime = usePracticeStore(selectSessionAvgTime);
  const bestTime = usePracticeStore(selectSessionBestTime);

  return (
    <div className={`flex items-center gap-6 py-3 px-4 rounded-xl bg-white/5 border border-white/8 text-sm ${className}`}>
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Questions</span>
        <span className="text-white font-bold text-xl">{sessionQuestions.length}</span>
      </div>
      <div className="w-px h-8 bg-white/10" />
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Avg Time</span>
        <span className="text-white font-bold text-xl">
          {avgTime !== null ? `${avgTime.toFixed(1)}s` : '—'}
        </span>
      </div>
      <div className="w-px h-8 bg-white/10" />
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Best</span>
        <span className="text-green-400 font-bold text-xl">
          {bestTime !== null ? `${bestTime.toFixed(1)}s` : '—'}
        </span>
      </div>
    </div>
  );
}
