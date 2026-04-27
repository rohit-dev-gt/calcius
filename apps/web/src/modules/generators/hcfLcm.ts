import type { Difficulty } from '@calcura/shared';
import { randInt, gcd, lcm, pick } from './utils';
import type { GeneratedQuestion } from './utils';

function getRange(difficulty: Difficulty): [number, number] {
  switch (difficulty) {
    case 'BASIC':        return [10, 99];
    case 'INTERMEDIATE': return [10, 999];
    case 'ADVANCED':     return [100, 9999];
    case 'GENIUS':       return [1000, 9999];
  }
}

export function generateHcfLcm(difficulty: Difficulty): GeneratedQuestion {
  const [min, max] = getRange(difficulty);
  const isLcm = Math.random() > 0.4;
  const useThree = difficulty === 'ADVANCED' || difficulty === 'GENIUS';

  const a = randInt(min, max);
  const b = randInt(min, max);
  const c = useThree ? randInt(min, max) : 0;

  if (isLcm) {
    const result = useThree ? lcm(lcm(a, b), c) : lcm(a, b);
    const nums = useThree ? `${a}, ${b}, and ${c}` : `${a} and ${b}`;
    return {
      text: difficulty === 'GENIUS'
        ? `Find the smallest number divisible by ${nums}`
        : `LCM of ${nums}`,
      answer: `${result.toLocaleString('en-IN')}`,
      operationType: 'LCM',
    };
  } else {
    const result = useThree ? gcd(gcd(a, b), c) : gcd(a, b);
    const nums = useThree ? `${a}, ${b}, and ${c}` : `${a} and ${b}`;
    return {
      text: `HCF of ${nums}`,
      answer: `${result}`,
      operationType: 'HCF',
    };
  }
}
