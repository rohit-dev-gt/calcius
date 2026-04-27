import type { Difficulty } from '@calcura/shared';
import { randInt } from './utils';
import type { GeneratedQuestion } from './utils';

function getTableRange(difficulty: Difficulty): [number, number] {
  switch (difficulty) {
    case 'BASIC':        return [2, 10];
    case 'INTERMEDIATE': return [11, 20];
    case 'ADVANCED':     return [21, 30];
    case 'GENIUS':       return [31, 99];
  }
}

export function generateTables(difficulty: Difficulty): GeneratedQuestion {
  const [min, max] = getTableRange(difficulty);
  const table = randInt(min, max);
  const multiplierMax = difficulty === 'GENIUS' ? 20 : 20;
  const multiplier = randInt(1, multiplierMax);
  const result = table * multiplier;

  // Occasionally use reverse format
  const isReverse = Math.random() > 0.75;
  if (isReverse) {
    return {
      text: `? × ${table} = ${result.toLocaleString('en-IN')}`,
      answer: `${multiplier}`,
      operationType: 'Missing Factor',
    };
  }

  return {
    text: `${table} × ${multiplier}`,
    answer: `${result.toLocaleString('en-IN')}`,
    operationType: 'Multiplication Table',
  };
}
