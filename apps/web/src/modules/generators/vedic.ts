import type { Difficulty } from '@calcura/shared';
import { randInt, pick } from './utils';
import type { GeneratedQuestion } from './utils';

interface VedicTemplate {
  sutra: string;
  formula: string;
  generate: () => { text: string; answer: string; workedExample: string };
}

const VEDIC_TEMPLATES: VedicTemplate[] = [
  {
    sutra: 'Nikhilam Navatashcaramam Dashatah',
    formula: 'Multiply numbers near a base (10, 100, 1000)',
    generate: () => {
      const base = pick([10, 100]);
      const a = base - randInt(1, base > 50 ? 15 : 4);
      const b = base - randInt(1, base > 50 ? 15 : 4);
      const defA = a - base;
      const defB = b - base;
      const answer = a * b;
      return {
        text: `${a} × ${b}`,
        answer: `${answer}`,
        workedExample: `Both near ${base}. Deviations: ${defA}, ${defB}. Cross: ${a}+${defB}=${a+defB}. Product of deviations: ${defA*defB}. Answer: ${a+defB}|${String(Math.abs(defA*defB)).padStart(base === 100 ? 2 : 1, '0')} = ${answer}`,
      };
    },
  },
  {
    sutra: 'Ekadhikena Purvena',
    formula: 'Squaring numbers ending in 5: (a5)² = a(a+1) | 25',
    generate: () => {
      const tens = randInt(1, 12);
      const n = tens * 10 + 5;
      const answer = n * n;
      return {
        text: `${n}²`,
        answer: `${answer}`,
        workedExample: `${n}²: prefix=${tens}, next=${tens+1}, left=${tens*(tens+1)}, right=25. Answer: ${tens*(tens+1)}25 = ${answer}`,
      };
    },
  },
  {
    sutra: 'Urdhva Tiryagbhyam (Vertically & Crosswise)',
    formula: 'AB × CD = (A×C)|(A×D+B×C)|(B×D)',
    generate: () => {
      const a = randInt(11, 99);
      const b = randInt(11, 99);
      const answer = a * b;
      const [a1, a2] = [Math.floor(a/10), a%10];
      const [b1, b2] = [Math.floor(b/10), b%10];
      return {
        text: `${a} × ${b}`,
        answer: `${answer}`,
        workedExample: `Vertical: ${a1}×${b1}=${a1*b1}, Cross: ${a1}×${b2}+${a2}×${b1}=${a1*b2+a2*b1}, Vertical: ${a2}×${b2}=${a2*b2}. Combine to get ${answer}`,
      };
    },
  },
  {
    sutra: 'Anurupyena (Proportionality)',
    formula: 'Simplify by proportional adjustment before multiplying',
    generate: () => {
      const base = pick([50, 100, 200, 500]);
      const a = base + randInt(1, 20) * pick([1, -1]);
      const b = base + randInt(1, 20) * pick([1, -1]);
      return {
        text: `${a} × ${b}`,
        answer: `${a * b}`,
        workedExample: `Both near ${base}. Adjust: (${base}+${a-base}) × (${base}+${b-base}) = ${base}² + ${base}×${a-base+b-base} + ${(a-base)*(b-base)} = ${a*b}`,
      };
    },
  },
  {
    sutra: 'Vinculum (All from 9, last from 10)',
    formula: 'Subtraction from base: 1000 − N = (9−a)(9−b)(10−c)',
    generate: () => {
      const base = pick([100, 1000]);
      const n = randInt(Math.floor(base * 0.6), base - 1);
      const answer = base - n;
      return {
        text: `${base} − ${n}`,
        answer: `${answer}`,
        workedExample: `From ${base}: all digits from 9 except last from 10. ${base} − ${n} = ${answer}`,
      };
    },
  },
];

export function generateVedic(difficulty: Difficulty): GeneratedQuestion {
  const templateIdx = randInt(0, VEDIC_TEMPLATES.length - 1);
  const template = VEDIC_TEMPLATES[templateIdx];
  const { text, answer, workedExample } = template.generate();

  return {
    text,
    answer,
    operationType: template.sutra.split(' ')[0],
    hint: `Sutra: ${template.sutra}\nFormula: ${template.formula}\n\n${workedExample}`,
  };
}
