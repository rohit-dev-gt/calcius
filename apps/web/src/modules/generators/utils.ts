import type { Difficulty } from '@calcura/shared';

export interface GeneratedQuestion {
  text: string;
  answer: string;
  operationType?: string;
  hint?: string;
  options?: string[]; // for MCQ modules (Approximation)
  correctOptionIndex?: number;
}

/** Uniform random integer in [min, max] inclusive */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Format large numbers with commas */
export function formatNumber(n: number): string {
  return n.toLocaleString('en-IN');
}

/** Compute GCD of two numbers */
export function gcd(a: number, b: number): number {
  while (b !== 0) { const t = b; b = a % b; a = t; }
  return a;
}

/** Compute LCM of two numbers */
export function lcm(a: number, b: number): number {
  return (a / gcd(a, b)) * b;
}

/** Shuffle an array (Fisher-Yates) */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick a random element from an array */
export function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}
