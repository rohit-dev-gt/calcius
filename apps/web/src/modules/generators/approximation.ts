import type { Difficulty } from '@calcura/shared';
import { randInt, shuffle } from './utils';
import type { GeneratedQuestion } from './utils';

export function generateApproximation(difficulty: Difficulty): GeneratedQuestion {
  // SSC/IBPS-style approximation — MCQ with 4 options
  const templates = [
    () => {
      const n = randInt(400, 900);
      const multiplier = randInt(15, 35);
      const divisor = randInt(4, 12);
      const exact = Math.sqrt(n) * multiplier / divisor;
      const rounded = Math.round(exact / 5) * 5;
      return { expr: `√${n} × ${multiplier} ÷ ${divisor}`, exact };
    },
    () => {
      const a = randInt(30, 80) + 0.9;
      const b = randInt(30, 80) + 0.8;
      const exact = a * b;
      return { expr: `${a} × ${b}`, exact };
    },
    () => {
      const n = randInt(1000, 9000);
      const pct = randInt(12, 38);
      const exact = (pct / 100) * n;
      return { expr: `${pct}% of ${n}`, exact };
    },
    () => {
      const a = randInt(200, 800);
      const b = randInt(100, 400);
      const c = randInt(2, 9);
      const exact = (a + b) / c;
      return { expr: `(${a} + ${b}) ÷ ${c}`, exact };
    },
  ];

  const template = templates[randInt(0, templates.length - 1)]();
  const { expr, exact } = template;

  // Generate 4 plausible options
  const correctRounded = Math.round(exact / 10) * 10 || Math.round(exact);
  const offsets = shuffle([-20, -10, 10, 20, -30, 30]).slice(0, 3);
  const allOptions = [correctRounded, ...offsets.map((o) => correctRounded + o)];
  const shuffled = shuffle(allOptions);
  const correctIdx = shuffled.indexOf(correctRounded);

  return {
    text: `${expr} ≈ ?`,
    answer: `${correctRounded}`,
    operationType: 'Approximation',
    options: shuffled.map(String),
    correctOptionIndex: correctIdx,
  };
}
