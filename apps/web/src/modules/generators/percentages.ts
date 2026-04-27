import type { Difficulty } from '@calcura/shared';
import { randInt, pick } from './utils';
import type { GeneratedQuestion } from './utils';

const COMMON_PERCENTAGES = [5, 10, 12.5, 15, 20, 25, 30, 33.33, 37.5, 40, 50, 60, 62.5, 66.67, 75, 80];

export function generatePercentages(difficulty: Difficulty): GeneratedQuestion {
  switch (difficulty) {
    case 'BASIC': {
      const pct = pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80]);
      const base = randInt(1, 50) * 20; // multiples of 20
      const ans = Math.round((pct / 100) * base);
      return {
        text: `What is ${pct}% of ${base.toLocaleString('en-IN')}?`,
        answer: `${ans.toLocaleString('en-IN')}`,
        operationType: 'Percentage of Number',
      };
    }
    case 'INTERMEDIATE': {
      const pct = pick([12.5, 37.5, 62.5, 87.5, 16.67, 33.33, 66.67, 83.33]);
      const base = randInt(1, 40) * 100;
      const ans = Math.round((pct / 100) * base * 100) / 100;
      return {
        text: `What is ${pct}% of ${base.toLocaleString('en-IN')}?`,
        answer: `${ans.toLocaleString('en-IN')}`,
        operationType: 'Fractional Percentage',
      };
    }
    case 'ADVANCED': {
      // Reverse: X is what % of Y?
      const base = randInt(2, 20) * 100;
      const part = randInt(1, base);
      const pct = Math.round((part / base) * 100 * 100) / 100;
      return {
        text: `${part.toLocaleString('en-IN')} is what % of ${base.toLocaleString('en-IN')}?`,
        answer: `${pct}%`,
        operationType: 'Reverse Percentage',
      };
    }
    case 'GENIUS': {
      // Chain percentage / successive discount
      const original = randInt(5, 20) * 1000;
      const p1 = pick([5, 10, 15, 20, 25]);
      const p2 = pick([5, 8, 10, 12, 15]);
      const after1 = original * (1 + p1 / 100);
      const after2 = after1 * (1 - p2 / 100);
      const netChange = Math.round(((after2 - original) / original) * 100 * 100) / 100;
      return {
        text: `A price of ₹${original.toLocaleString('en-IN')} increases by ${p1}%, then decreases by ${p2}%. What is the net change?`,
        answer: `${netChange > 0 ? '+' : ''}${netChange}%`,
        operationType: 'Chain Percentage',
      };
    }
  }
}
