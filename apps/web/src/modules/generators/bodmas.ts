import type { Difficulty } from '@calcura/shared';
import { randInt, pick } from './utils';
import type { GeneratedQuestion } from './utils';

export function generateBodmas(difficulty: Difficulty): GeneratedQuestion {
  switch (difficulty) {
    case 'BASIC': {
      const a = randInt(10, 50);
      const b = randInt(2, 20);
      const c = randInt(2, 10);
      const d = randInt(2, 10);
      const e = randInt(1, 20);
      const result = a + b / c * d - e;
      return {
        text: `${a} + ${b} ÷ ${c} × ${d} − ${e}`,
        answer: `${Math.round(result * 100) / 100}`,
        operationType: 'BODMAS Basic',
      };
    }
    case 'INTERMEDIATE': {
      const a = randInt(5, 30);
      const b = randInt(2, 15);
      const c = randInt(2, 8);
      const d = randInt(1, 10);
      const e = randInt(2, 8);
      const f = randInt(1, 15);
      const result = (a + b * c) - (d + e) * f;
      return {
        text: `(${a} + ${b} × ${c}) − (${d} + ${e}) × ${f}`,
        answer: `${result}`,
        operationType: 'BODMAS with Brackets',
      };
    }
    case 'ADVANCED': {
      const a = randInt(2, 10);
      const b = randInt(2, 6);
      const c = randInt(2, 20);
      const d = randInt(2, 10);
      const inner = a * b + c;
      const result = Math.sqrt(inner) * d - Math.pow(2, randInt(2, 4));
      return {
        text: `√(${a} × ${b} + ${c}) × ${d} − 2^${randInt(2, 4)}`,
        answer: `${Math.round(result * 100) / 100}`,
        operationType: 'BODMAS with Surds',
      };
    }
    case 'GENIUS': {
      const a = randInt(3, 15);
      const b = randInt(2, 8);
      const c = randInt(4, 20);
      const d = randInt(2, 12);
      const e = randInt(1, 6);
      const f = randInt(2, 5);
      const result = (a + b) * c - d / e + Math.pow(f, 2);
      return {
        text: `{(${a} + ${b}) × ${c} − ${d} ÷ ${e}} + ${f}²`,
        answer: `${Math.round(result * 100) / 100}`,
        operationType: 'SSC-style BODMAS',
      };
    }
  }
}
