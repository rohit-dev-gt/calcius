import type { Difficulty } from '@calcura/shared';
import { randInt } from './utils';
import type { GeneratedQuestion } from './utils';

export function generateCubes(difficulty: Difficulty): GeneratedQuestion {
  const isRoot = Math.random() > 0.5;

  let n: number;
  switch (difficulty) {
    case 'BASIC':        n = randInt(1, 10);  break;
    case 'INTERMEDIATE': n = randInt(11, 20); break;
    case 'ADVANCED':     n = randInt(21, 30); break;
    case 'GENIUS':       n = randInt(31, 50); break;
  }

  if (isRoot && difficulty !== 'GENIUS') {
    const cube = n * n * n;
    return {
      text: `∛${cube.toLocaleString('en-IN')}`,
      answer: `${n}`,
      operationType: 'Cube Root',
    };
  } else {
    if (difficulty === 'GENIUS') {
      // Cube root of 6-digit number
      const cube = n * n * n;
      if (Math.random() > 0.5) {
        return {
          text: `∛${cube.toLocaleString('en-IN')}`,
          answer: `${n}`,
          operationType: 'Cube Root',
        };
      }
    }
    return {
      text: `${n}³`,
      answer: `${(n * n * n).toLocaleString('en-IN')}`,
      operationType: 'Cube',
    };
  }
}
