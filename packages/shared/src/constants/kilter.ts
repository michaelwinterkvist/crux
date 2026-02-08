import type { GradeDefinition } from './grades.js';
import { V_SCALE_GRADES } from './grades.js';

/**
 * Kilter Board difficulty → V-scale mapping.
 * Kilter uses a continuous numeric scale where each integer roughly corresponds
 * to a V-grade. These mappings are based on community consensus.
 *
 * Reference: https://kilterboardapp.com grade display
 */
const KILTER_DIFFICULTY_TO_V: [number, string][] = [
  [1, 'VB'],
  [4, 'V0'],
  [7, 'V1'],
  [10, 'V2'],
  [13, 'V3'],
  [16, 'V4'],
  [19, 'V5'],
  [22, 'V6'],
  [25, 'V7'],
  [28, 'V8'],
  [31, 'V9'],
  [34, 'V10'],
  [37, 'V11'],
  [40, 'V12'],
  [43, 'V13'],
  [46, 'V14'],
  [49, 'V15'],
  [52, 'V16'],
  [55, 'V17'],
];

/**
 * Convert Kilter Board numeric difficulty to V-scale grade string.
 * Returns the closest V-grade at or below the given difficulty.
 */
export function kilterDifficultyToVGrade(difficulty: number): string {
  let result = 'VB';
  for (const [threshold, grade] of KILTER_DIFFICULTY_TO_V) {
    if (difficulty >= threshold) result = grade;
    else break;
  }
  return result;
}

/**
 * Convert Kilter Board numeric difficulty to Crux normalized grade number.
 * Uses the V-scale lookup then maps to the numeric value.
 */
export function kilterDifficultyToNumeric(difficulty: number): number {
  const vGrade = kilterDifficultyToVGrade(difficulty);
  const def = V_SCALE_GRADES.find((g: GradeDefinition) => g.grade === vGrade);
  return def?.numeric ?? 300;
}

export const KILTER_API_BASE_URL = 'https://kilterboardapp.com';
