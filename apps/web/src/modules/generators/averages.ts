import type { Difficulty } from '@calcura/shared';
import { randInt, pick } from './utils';
import type { GeneratedQuestion } from './utils';

export function generateAverages(difficulty: Difficulty): GeneratedQuestion {
  const mode = pick(['simple_avg', 'weighted_avg', 'avg_shift', 'ratio'] as const);

  switch (mode) {
    case 'simple_avg': {
      const count = difficulty === 'BASIC' ? 4 : difficulty === 'INTERMEDIATE' ? 5 : 6;
      const nums = Array.from({ length: count }, () => randInt(10, difficulty === 'GENIUS' ? 999 : 99));
      const avg = Math.round(nums.reduce((a, b) => a + b, 0) / count * 100) / 100;
      return {
        text: `Average of ${nums.join(', ')}`,
        answer: `${avg}`,
        operationType: 'Simple Average',
      };
    }
    case 'weighted_avg': {
      const w1 = randInt(2, 10);
      const w2 = randInt(2, 10);
      const v1 = randInt(10, 80);
      const v2 = randInt(10, 80);
      const wavg = Math.round(((v1 * w1 + v2 * w2) / (w1 + w2)) * 100) / 100;
      return {
        text: `${w1} students scored avg ${v1} and ${w2} students scored avg ${v2}. Combined average?`,
        answer: `${wavg}`,
        operationType: 'Weighted Average',
      };
    }
    case 'avg_shift': {
      const count = randInt(4, 10);
      const origAvg = randInt(30, 80);
      const newNum = randInt(10, 120);
      const newAvg = Math.round(((origAvg * count + newNum) / (count + 1)) * 100) / 100;
      return {
        text: `Average of ${count} numbers is ${origAvg}. If ${newNum} is added, new average?`,
        answer: `${newAvg}`,
        operationType: 'Average with Addition',
      };
    }
    case 'ratio': {
      const a = randInt(1, 10);
      const b = randInt(1, 10);
      const total = (a + b) * randInt(5, 30);
      const share1 = (a / (a + b)) * total;
      return {
        text: `Divide ${total.toLocaleString('en-IN')} in ratio ${a}:${b}. Larger share?`,
        answer: `${Math.max(share1, total - share1).toLocaleString('en-IN')}`,
        operationType: 'Ratio & Proportion',
      };
    }
  }
}
