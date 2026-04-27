import type { Difficulty, ModuleType } from '@calcura/shared';
import { generateArithmetic } from './arithmetic';
import { generateSquares } from './squares';
import { generateCubes } from './cubes';
import { generateTables } from './tables';
import { generatePercentages } from './percentages';
import { generateFractions } from './fractions';
import { generateHcfLcm } from './hcfLcm';
import { generatePowers } from './powers';
import { generateSeries } from './series';
import { generateBodmas } from './bodmas';
import { generateAverages } from './averages';
import { generateVedic } from './vedic';
import { generateApproximation } from './approximation';
import { pick } from './utils';
import type { GeneratedQuestion } from './utils';

const ALL_MODULES: Exclude<ModuleType, 'MOCK'>[] = [
  'ARITHMETIC', 'SQUARES', 'CUBES', 'TABLES', 'PERCENTAGES',
  'FRACTIONS', 'HCF_LCM', 'POWERS', 'SERIES', 'BODMAS',
  'AVERAGES', 'VEDIC', 'APPROXIMATION',
];

export function generateFromModule(module: ModuleType, difficulty: Difficulty): GeneratedQuestion {
  switch (module) {
    case 'ARITHMETIC':    return generateArithmetic(difficulty);
    case 'SQUARES':       return generateSquares(difficulty);
    case 'CUBES':         return generateCubes(difficulty);
    case 'TABLES':        return generateTables(difficulty);
    case 'PERCENTAGES':   return generatePercentages(difficulty);
    case 'FRACTIONS':     return generateFractions(difficulty);
    case 'HCF_LCM':       return generateHcfLcm(difficulty);
    case 'POWERS':        return generatePowers(difficulty);
    case 'SERIES':        return generateSeries(difficulty);
    case 'BODMAS':        return generateBodmas(difficulty);
    case 'AVERAGES':      return generateAverages(difficulty);
    case 'VEDIC':         return generateVedic(difficulty);
    case 'APPROXIMATION': return generateApproximation(difficulty);
    case 'MOCK':          return generateMockQuestion(difficulty);
  }
}

export function generateMockQuestion(
  difficulty: Difficulty,
  weakModules?: ModuleType[]
): GeneratedQuestion & { module: ModuleType } {
  // Weight towards weak modules if provided, else uniform
  const pool = weakModules && weakModules.length > 0
    ? [...weakModules, ...weakModules, ...ALL_MODULES] // double weight for weak
    : ALL_MODULES;

  const module = pick(pool) as Exclude<ModuleType, 'MOCK'>;
  const question = generateFromModule(module, difficulty);
  return { ...question, module };
}

export type { GeneratedQuestion };
