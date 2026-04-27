import type { Difficulty } from '@calcura/shared';
import { randInt, gcd, pick } from './utils';
import type { GeneratedQuestion } from './utils';

function makeFraction(maxDenom: number): [number, number] {
  // Always reducible (GCD > 1)
  const g = randInt(2, 5);
  const num = randInt(1, maxDenom / g - 1) * g;
  const den = randInt(num + 1, maxDenom) / g * g;
  return [num, Math.max(num + 1, den)];
}

export function generateFractions(difficulty: Difficulty): GeneratedQuestion {
  const maxDenom = difficulty === 'BASIC' ? 20 : difficulty === 'INTERMEDIATE' ? 50 : difficulty === 'ADVANCED' ? 100 : 200;
  const mode = pick(['simplify', 'compare', 'add', 'convert'] as const);

  switch (mode) {
    case 'simplify': {
      const g = randInt(2, maxDenom > 50 ? 8 : 5);
      const num = randInt(2, 20) * g;
      const den = randInt(num / g + 1, 25) * g;
      const rn = num / g;
      const rd = den / g;
      const commonFactor = gcd(rn, rd);
      const finalN = rn / commonFactor;
      const finalD = rd / commonFactor;
      return {
        text: `Simplify: ${num}/${den}`,
        answer: `${finalN}/${finalD}`,
        operationType: 'Simplify Fraction',
      };
    }
    case 'compare': {
      const [n1, d1] = makeFraction(maxDenom);
      const [n2, d2] = makeFraction(maxDenom);
      const val1 = n1 / d1;
      const val2 = n2 / d2;
      const greater = val1 > val2 ? `${n1}/${d1}` : `${n2}/${d2}`;
      return {
        text: `Which is greater: ${n1}/${d1} or ${n2}/${d2}?`,
        answer: greater,
        operationType: 'Compare Fractions',
      };
    }
    case 'add': {
      const [n1, d1] = makeFraction(maxDenom);
      const [n2, d2] = makeFraction(maxDenom);
      const lcmD = (d1 * d2) / gcd(d1, d2);
      const sumN = n1 * (lcmD / d1) + n2 * (lcmD / d2);
      const g = gcd(sumN, lcmD);
      return {
        text: `${n1}/${d1} + ${n2}/${d2}`,
        answer: `${sumN / g}/${lcmD / g}`,
        operationType: 'Add Fractions',
      };
    }
    case 'convert': {
      const n = randInt(1, 7);
      const d = pick([4, 5, 8, 10, 16, 20, 25, 100]);
      const dec = Math.round((n / d) * 10000) / 10000;
      const pct = Math.round(dec * 100 * 100) / 100;
      return {
        text: `Convert ${n}/${d} to a percentage`,
        answer: `${pct}%`,
        operationType: 'Fraction to Percentage',
      };
    }
  }
}
