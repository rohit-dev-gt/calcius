import type { Difficulty } from '@calcura/shared';
import { randInt, pick } from './utils';
import type { GeneratedQuestion } from './utils';

function getIdentityHint(n: number): string {
  if (n % 10 === 5) return `(${Math.floor(n/10)*10} + 5)² = ${Math.floor(n/10)*10}² + 2×${Math.floor(n/10)*10}×5 + 25`;
  const near = Math.round(n / 10) * 10;
  const diff = n - near;
  if (diff !== 0) {
    return `(${near} ${diff > 0 ? '+' : ''}${diff})² = ${near}² ${diff > 0 ? '+' : '−'} 2×${near}×${Math.abs(diff)} + ${diff*diff}`;
  }
  return `${n}² = ${n * n}`;
}

export function generateSquares(difficulty: Difficulty): GeneratedQuestion {
  const isRoot = Math.random() > 0.5;

  let n: number;
  switch (difficulty) {
    case 'BASIC':        n = randInt(1, 25);   break;
    case 'INTERMEDIATE': n = randInt(26, 50);  break;
    case 'ADVANCED':     n = randInt(51, 100); break;
    case 'GENIUS':       n = randInt(101, 200);break;
  }

  if (isRoot && difficulty !== 'GENIUS') {
    // Square root — only for perfect squares
    const sq = n * n;
    return {
      text: `√${sq}`,
      answer: `${n}`,
      operationType: 'Square Root',
      hint: `${n}² = ${sq}`,
    };
  } else {
    return {
      text: `${n}²`,
      answer: `${n * n}`,
      operationType: 'Square',
      hint: getIdentityHint(n),
    };
  }
}
