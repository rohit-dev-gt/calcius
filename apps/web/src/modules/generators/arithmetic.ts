import type { Difficulty } from '@calcura/shared';
import { randInt, formatNumber, pick } from './utils';
import type { GeneratedQuestion } from './utils';

type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed';

interface ArithmeticOptions {
  operation?: Operation;
}

function getRange(difficulty: Difficulty): [number, number] {
  switch (difficulty) {
    case 'BASIC':        return [10, 99];
    case 'INTERMEDIATE': return [100, 9999];
    case 'ADVANCED':     return [10000, 999999];
    case 'GENIUS':       return [100000, 9999999];
  }
}

function generateAddition(difficulty: Difficulty): GeneratedQuestion {
  const [min, max] = getRange(difficulty);
  const a = randInt(min, max);
  const b = randInt(min, max);
  return {
    text: `${formatNumber(a)} + ${formatNumber(b)}`,
    answer: formatNumber(a + b),
    operationType: 'Addition',
  };
}

function generateSubtraction(difficulty: Difficulty): GeneratedQuestion {
  const [min, max] = getRange(difficulty);
  const b = randInt(min, max);
  const a = randInt(b, max); // ensure a >= b → positive result
  return {
    text: `${formatNumber(a)} − ${formatNumber(b)}`,
    answer: formatNumber(a - b),
    operationType: 'Subtraction',
  };
}

function generateMultiplication(difficulty: Difficulty): GeneratedQuestion {
  switch (difficulty) {
    case 'BASIC': {
      const a = randInt(10, 99);
      const b = randInt(10, 99);
      return { text: `${a} × ${b}`, answer: formatNumber(a * b), operationType: 'Multiplication' };
    }
    case 'INTERMEDIATE': {
      const a = randInt(100, 9999);
      const b = randInt(10, 99);
      return { text: `${formatNumber(a)} × ${b}`, answer: formatNumber(a * b), operationType: 'Multiplication' };
    }
    case 'ADVANCED': {
      const a = randInt(10000, 99999);
      const b = randInt(100, 999);
      return { text: `${formatNumber(a)} × ${b}`, answer: formatNumber(a * b), operationType: 'Multiplication' };
    }
    case 'GENIUS': {
      const a = randInt(100000, 9999999);
      const b = randInt(10, 99);
      const op2 = randInt(1000, 99999);
      // Chained: a × b − op2
      const result = a * b - op2;
      return {
        text: `${formatNumber(a)} × ${b} − ${formatNumber(op2)}`,
        answer: formatNumber(result),
        operationType: 'Chained',
      };
    }
  }
}

function generateDivision(difficulty: Difficulty): GeneratedQuestion {
  // Generate divisor and quotient first → dividend is always whole
  const quotientRange = getRange(difficulty);
  const quotient = randInt(Math.ceil(quotientRange[0] / 100), Math.floor(quotientRange[1] / 10));
  const divisorMax = difficulty === 'BASIC' ? 9 : difficulty === 'INTERMEDIATE' ? 99 : difficulty === 'ADVANCED' ? 999 : 9999;
  const divisor = randInt(2, divisorMax);
  const dividend = quotient * divisor;

  return {
    text: `${formatNumber(dividend)} ÷ ${formatNumber(divisor)}`,
    answer: formatNumber(quotient),
    operationType: 'Division',
  };
}

export function generateArithmetic(
  difficulty: Difficulty,
  options: ArithmeticOptions = {}
): GeneratedQuestion {
  const ops: Operation[] = ['addition', 'subtraction', 'multiplication', 'division'];
  const operation = options.operation === 'mixed'
    ? pick(ops)
    : options.operation || pick(ops);

  switch (operation) {
    case 'addition':       return generateAddition(difficulty);
    case 'subtraction':    return generateSubtraction(difficulty);
    case 'multiplication': return generateMultiplication(difficulty);
    case 'division':       return generateDivision(difficulty);
    default:               return generateAddition(difficulty);
  }
}
