import type { Difficulty } from '@calcura/shared';
import { randInt, pick } from './utils';
import type { GeneratedQuestion } from './utils';

// Last digit patterns for common bases
const LAST_DIGIT_CYCLES: Record<number, number[]> = {
  2: [2, 4, 8, 6], 3: [3, 9, 7, 1], 4: [4, 6],
  7: [7, 9, 3, 1], 8: [8, 4, 2, 6], 9: [9, 1],
};

export function generatePowers(difficulty: Difficulty): GeneratedQuestion {
  const mode = pick(['power_of_2', 'power_of_3', 'power_of_5', 'last_digit', 'simplify']);

  switch (mode) {
    case 'power_of_2': {
      const exp = difficulty === 'BASIC' ? randInt(1, 10)
        : difficulty === 'INTERMEDIATE' ? randInt(11, 15)
        : difficulty === 'ADVANCED' ? randInt(16, 20)
        : randInt(1, 20);
      return { text: `2^${exp}`, answer: `${Math.pow(2, exp).toLocaleString('en-IN')}`, operationType: 'Power of 2' };
    }
    case 'power_of_3': {
      const exp = difficulty === 'BASIC' ? randInt(1, 6) : randInt(7, 12);
      return { text: `3^${exp}`, answer: `${Math.pow(3, exp).toLocaleString('en-IN')}`, operationType: 'Power of 3' };
    }
    case 'power_of_5': {
      const exp = difficulty === 'BASIC' ? randInt(1, 5) : randInt(6, 10);
      return { text: `5^${exp}`, answer: `${Math.pow(5, exp).toLocaleString('en-IN')}`, operationType: 'Power of 5' };
    }
    case 'last_digit': {
      const base = pick([2, 3, 4, 7, 8, 9]);
      const exp = randInt(10, 100);
      const cycle = LAST_DIGIT_CYCLES[base];
      const lastDigit = cycle[(exp - 1) % cycle.length];
      return {
        text: `Last digit of ${base}^${exp}?`,
        answer: `${lastDigit}`,
        operationType: 'Last Digit',
        hint: `${base} follows a ${cycle.length}-digit cycle: ${cycle.join(' → ')}`,
      };
    }
    case 'simplify': {
      const b1 = pick([2, 3, 4, 8]);
      const e1 = randInt(2, 5);
      const b2 = pick([2, 4, 8]);
      const e2 = randInt(1, 4);
      // Express everything as powers of 2 to simplify
      const val = Math.pow(b1, e1) * Math.pow(b2, e2);
      return {
        text: `${b1}^${e1} × ${b2}^${e2}`,
        answer: `${val.toLocaleString('en-IN')}`,
        operationType: 'Simplify Exponents',
      };
    }
  }
  return { text: '2^10', answer: '1,024', operationType: 'Power' };
}
