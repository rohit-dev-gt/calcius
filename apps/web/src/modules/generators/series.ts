import type { Difficulty } from '@calcura/shared';
import { randInt, pick } from './utils';
import type { GeneratedQuestion } from './utils';

function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
  return true;
}

export function generateSeries(difficulty: Difficulty): GeneratedQuestion {
  const termCount = difficulty === 'BASIC' ? 5 : difficulty === 'INTERMEDIATE' ? 6 : difficulty === 'GENIUS' ? 8 : 7;
  const mode = pick(['ap', 'gp', 'fibonacci', 'squares', 'cubes', 'wrong_number'] as const);

  switch (mode) {
    case 'ap': {
      const start = randInt(1, 50);
      const diff = randInt(2, 20) * (Math.random() > 0.5 ? 1 : -1);
      if (start + diff * termCount < 0 && diff < 0) break; // avoid negatives in basic
      const terms = Array.from({ length: termCount }, (_, i) => start + diff * i);
      const next = start + diff * termCount;
      return {
        text: `${terms.join(', ')}, ?`,
        answer: `${next}`,
        operationType: 'Arithmetic Progression',
      };
    }
    case 'gp': {
      const start = randInt(1, 10);
      const ratio = pick([2, 3, 4]);
      const terms = Array.from({ length: termCount }, (_, i) => start * Math.pow(ratio, i));
      if (terms[termCount - 1] > 100000) break;
      const next = terms[termCount - 1] * ratio;
      return {
        text: `${terms.map((t) => t.toLocaleString('en-IN')).join(', ')}, ?`,
        answer: `${next.toLocaleString('en-IN')}`,
        operationType: 'Geometric Progression',
      };
    }
    case 'fibonacci': {
      const a = randInt(1, 10);
      const b = randInt(a, a + 10);
      const terms: number[] = [a, b];
      for (let i = 2; i < termCount; i++) terms.push(terms[i - 1] + terms[i - 2]);
      const next = terms[termCount - 1] + terms[termCount - 2];
      return {
        text: `${terms.join(', ')}, ?`,
        answer: `${next}`,
        operationType: 'Fibonacci-type',
      };
    }
    case 'squares': {
      const offset = randInt(1, 5);
      const terms = Array.from({ length: termCount }, (_, i) => Math.pow(i + offset, 2));
      const next = Math.pow(termCount + offset, 2);
      return {
        text: `${terms.join(', ')}, ?`,
        answer: `${next}`,
        operationType: 'Square Series',
      };
    }
    case 'cubes': {
      const offset = randInt(1, 4);
      const terms = Array.from({ length: termCount }, (_, i) => Math.pow(i + offset, 3));
      if (terms[termCount - 1] > 200000) break;
      const next = Math.pow(termCount + offset, 3);
      return {
        text: `${terms.join(', ')}, ?`,
        answer: `${next}`,
        operationType: 'Cube Series',
      };
    }
    case 'wrong_number': {
      const start = randInt(2, 15);
      const diff = randInt(3, 12);
      const correct = Array.from({ length: termCount }, (_, i) => start + diff * i);
      const wrongIdx = randInt(1, termCount - 2);
      const wrongTerms = [...correct];
      wrongTerms[wrongIdx] = correct[wrongIdx] + pick([1, 2, 3, -1, -2, -3]) * randInt(1, 3);
      return {
        text: `Find the wrong number: ${wrongTerms.join(', ')}`,
        answer: `${wrongTerms[wrongIdx]} (should be ${correct[wrongIdx]})`,
        operationType: 'Wrong Number',
      };
    }
  }

  // Fallback AP
  const terms = [2, 5, 8, 11, 14, 17];
  return { text: `${terms.join(', ')}, ?`, answer: '20', operationType: 'Arithmetic Progression' };
}
