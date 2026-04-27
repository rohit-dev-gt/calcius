import { useEffect, useRef } from 'react';
import { usePracticeStore } from '../../store/practiceStore';

export function Timer() {
  const { timerRunning, timerStartMs, setElapsed, elapsedMs } = usePracticeStore();
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRunning) {
      const tick = () => {
        const elapsed = performance.now() - timerStartMs;
        setElapsed(elapsed);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [timerRunning, timerStartMs, setElapsed]);

  const seconds = (elapsedMs / 1000).toFixed(1);
  const numericSeconds = parseFloat(seconds);

  const colorClass = !timerRunning
    ? 'text-white/60'
    : numericSeconds < 5
    ? 'text-green-400'
    : numericSeconds < 15
    ? 'text-orange-400'
    : 'text-red-400';

  return (
    <div className={`timer-display font-mono font-bold text-4xl tracking-tight transition-colors duration-300 ${colorClass} ${timerRunning ? 'animate-pulse-timer' : ''}`}>
      {timerRunning || elapsedMs > 0 ? `${seconds}s` : '0.0s'}
    </div>
  );
}
