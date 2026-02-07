import type { GradeSystem } from './enums.js';

export interface GradeDefinition {
  grade: string;
  system: GradeSystem;
  numeric: number;
  band: string;
  sortOrder: number;
}

export const FONT_GRADES: GradeDefinition[] = [
  { grade: '3',    system: 'font', numeric: 300, band: '3', sortOrder: 0 },
  { grade: '4',    system: 'font', numeric: 400, band: '4', sortOrder: 1 },
  { grade: '4+',   system: 'font', numeric: 450, band: '4', sortOrder: 2 },
  { grade: '5',    system: 'font', numeric: 500, band: '5', sortOrder: 3 },
  { grade: '5+',   system: 'font', numeric: 550, band: '5', sortOrder: 4 },
  { grade: '6A',   system: 'font', numeric: 600, band: '6', sortOrder: 5 },
  { grade: '6A+',  system: 'font', numeric: 617, band: '6', sortOrder: 6 },
  { grade: '6B',   system: 'font', numeric: 633, band: '6', sortOrder: 7 },
  { grade: '6B+',  system: 'font', numeric: 650, band: '6', sortOrder: 8 },
  { grade: '6C',   system: 'font', numeric: 667, band: '6', sortOrder: 9 },
  { grade: '6C+',  system: 'font', numeric: 683, band: '6', sortOrder: 10 },
  { grade: '7A',   system: 'font', numeric: 700, band: '7', sortOrder: 11 },
  { grade: '7A+',  system: 'font', numeric: 717, band: '7', sortOrder: 12 },
  { grade: '7B',   system: 'font', numeric: 733, band: '7', sortOrder: 13 },
  { grade: '7B+',  system: 'font', numeric: 750, band: '7', sortOrder: 14 },
  { grade: '7C',   system: 'font', numeric: 767, band: '7', sortOrder: 15 },
  { grade: '7C+',  system: 'font', numeric: 783, band: '7', sortOrder: 16 },
  { grade: '8A',   system: 'font', numeric: 800, band: '8', sortOrder: 17 },
  { grade: '8A+',  system: 'font', numeric: 817, band: '8', sortOrder: 18 },
  { grade: '8B',   system: 'font', numeric: 833, band: '8', sortOrder: 19 },
  { grade: '8B+',  system: 'font', numeric: 850, band: '8', sortOrder: 20 },
  { grade: '8C',   system: 'font', numeric: 867, band: '8', sortOrder: 21 },
  { grade: '8C+',  system: 'font', numeric: 883, band: '8', sortOrder: 22 },
  { grade: '9A',   system: 'font', numeric: 900, band: '9', sortOrder: 23 },
];

export const FRENCH_GRADES: GradeDefinition[] = [
  { grade: '4a',   system: 'french', numeric: 400, band: '4', sortOrder: 0 },
  { grade: '4b',   system: 'french', numeric: 433, band: '4', sortOrder: 1 },
  { grade: '4c',   system: 'french', numeric: 467, band: '4', sortOrder: 2 },
  { grade: '5a',   system: 'french', numeric: 500, band: '5', sortOrder: 3 },
  { grade: '5b',   system: 'french', numeric: 533, band: '5', sortOrder: 4 },
  { grade: '5c',   system: 'french', numeric: 567, band: '5', sortOrder: 5 },
  { grade: '6a',   system: 'french', numeric: 600, band: '6', sortOrder: 6 },
  { grade: '6a+',  system: 'french', numeric: 617, band: '6', sortOrder: 7 },
  { grade: '6b',   system: 'french', numeric: 633, band: '6', sortOrder: 8 },
  { grade: '6b+',  system: 'french', numeric: 650, band: '6', sortOrder: 9 },
  { grade: '6c',   system: 'french', numeric: 667, band: '6', sortOrder: 10 },
  { grade: '6c+',  system: 'french', numeric: 683, band: '6', sortOrder: 11 },
  { grade: '7a',   system: 'french', numeric: 700, band: '7', sortOrder: 12 },
  { grade: '7a+',  system: 'french', numeric: 717, band: '7', sortOrder: 13 },
  { grade: '7b',   system: 'french', numeric: 733, band: '7', sortOrder: 14 },
  { grade: '7b+',  system: 'french', numeric: 750, band: '7', sortOrder: 15 },
  { grade: '7c',   system: 'french', numeric: 767, band: '7', sortOrder: 16 },
  { grade: '7c+',  system: 'french', numeric: 783, band: '7', sortOrder: 17 },
  { grade: '8a',   system: 'french', numeric: 800, band: '8', sortOrder: 18 },
  { grade: '8a+',  system: 'french', numeric: 817, band: '8', sortOrder: 19 },
  { grade: '8b',   system: 'french', numeric: 833, band: '8', sortOrder: 20 },
  { grade: '8b+',  system: 'french', numeric: 850, band: '8', sortOrder: 21 },
  { grade: '8c',   system: 'french', numeric: 867, band: '8', sortOrder: 22 },
  { grade: '8c+',  system: 'french', numeric: 883, band: '8', sortOrder: 23 },
  { grade: '9a',   system: 'french', numeric: 900, band: '9', sortOrder: 24 },
  { grade: '9a+',  system: 'french', numeric: 917, band: '9', sortOrder: 25 },
  { grade: '9b',   system: 'french', numeric: 933, band: '9', sortOrder: 26 },
  { grade: '9b+',  system: 'french', numeric: 950, band: '9', sortOrder: 27 },
];

export const V_SCALE_GRADES: GradeDefinition[] = [
  { grade: 'VB',   system: 'v_scale', numeric: 300, band: 'V0', sortOrder: 0 },
  { grade: 'V0',   system: 'v_scale', numeric: 400, band: 'V0', sortOrder: 1 },
  { grade: 'V1',   system: 'v_scale', numeric: 500, band: 'V1', sortOrder: 2 },
  { grade: 'V2',   system: 'v_scale', numeric: 550, band: 'V2', sortOrder: 3 },
  { grade: 'V3',   system: 'v_scale', numeric: 600, band: 'V3', sortOrder: 4 },
  { grade: 'V4',   system: 'v_scale', numeric: 650, band: 'V4', sortOrder: 5 },
  { grade: 'V5',   system: 'v_scale', numeric: 700, band: 'V5', sortOrder: 6 },
  { grade: 'V6',   system: 'v_scale', numeric: 733, band: 'V6', sortOrder: 7 },
  { grade: 'V7',   system: 'v_scale', numeric: 767, band: 'V7', sortOrder: 8 },
  { grade: 'V8',   system: 'v_scale', numeric: 800, band: 'V8', sortOrder: 9 },
  { grade: 'V9',   system: 'v_scale', numeric: 833, band: 'V9', sortOrder: 10 },
  { grade: 'V10',  system: 'v_scale', numeric: 850, band: 'V10', sortOrder: 11 },
  { grade: 'V11',  system: 'v_scale', numeric: 867, band: 'V11', sortOrder: 12 },
  { grade: 'V12',  system: 'v_scale', numeric: 883, band: 'V12', sortOrder: 13 },
  { grade: 'V13',  system: 'v_scale', numeric: 900, band: 'V13', sortOrder: 14 },
  { grade: 'V14',  system: 'v_scale', numeric: 917, band: 'V14', sortOrder: 15 },
  { grade: 'V15',  system: 'v_scale', numeric: 933, band: 'V15', sortOrder: 16 },
  { grade: 'V16',  system: 'v_scale', numeric: 950, band: 'V16', sortOrder: 17 },
  { grade: 'V17',  system: 'v_scale', numeric: 967, band: 'V17', sortOrder: 18 },
];

export const YDS_GRADES: GradeDefinition[] = [
  { grade: '5.5',   system: 'yds', numeric: 400, band: '5.5', sortOrder: 0 },
  { grade: '5.6',   system: 'yds', numeric: 433, band: '5.6', sortOrder: 1 },
  { grade: '5.7',   system: 'yds', numeric: 467, band: '5.7', sortOrder: 2 },
  { grade: '5.8',   system: 'yds', numeric: 500, band: '5.8', sortOrder: 3 },
  { grade: '5.9',   system: 'yds', numeric: 533, band: '5.9', sortOrder: 4 },
  { grade: '5.10a', system: 'yds', numeric: 567, band: '5.10', sortOrder: 5 },
  { grade: '5.10b', system: 'yds', numeric: 583, band: '5.10', sortOrder: 6 },
  { grade: '5.10c', system: 'yds', numeric: 600, band: '5.10', sortOrder: 7 },
  { grade: '5.10d', system: 'yds', numeric: 617, band: '5.10', sortOrder: 8 },
  { grade: '5.11a', system: 'yds', numeric: 633, band: '5.11', sortOrder: 9 },
  { grade: '5.11b', system: 'yds', numeric: 650, band: '5.11', sortOrder: 10 },
  { grade: '5.11c', system: 'yds', numeric: 667, band: '5.11', sortOrder: 11 },
  { grade: '5.11d', system: 'yds', numeric: 683, band: '5.11', sortOrder: 12 },
  { grade: '5.12a', system: 'yds', numeric: 700, band: '5.12', sortOrder: 13 },
  { grade: '5.12b', system: 'yds', numeric: 717, band: '5.12', sortOrder: 14 },
  { grade: '5.12c', system: 'yds', numeric: 733, band: '5.12', sortOrder: 15 },
  { grade: '5.12d', system: 'yds', numeric: 750, band: '5.12', sortOrder: 16 },
  { grade: '5.13a', system: 'yds', numeric: 767, band: '5.13', sortOrder: 17 },
  { grade: '5.13b', system: 'yds', numeric: 783, band: '5.13', sortOrder: 18 },
  { grade: '5.13c', system: 'yds', numeric: 800, band: '5.13', sortOrder: 19 },
  { grade: '5.13d', system: 'yds', numeric: 817, band: '5.13', sortOrder: 20 },
  { grade: '5.14a', system: 'yds', numeric: 833, band: '5.14', sortOrder: 21 },
  { grade: '5.14b', system: 'yds', numeric: 850, band: '5.14', sortOrder: 22 },
  { grade: '5.14c', system: 'yds', numeric: 867, band: '5.14', sortOrder: 23 },
  { grade: '5.14d', system: 'yds', numeric: 883, band: '5.14', sortOrder: 24 },
  { grade: '5.15a', system: 'yds', numeric: 900, band: '5.15', sortOrder: 25 },
  { grade: '5.15b', system: 'yds', numeric: 917, band: '5.15', sortOrder: 26 },
  { grade: '5.15c', system: 'yds', numeric: 933, band: '5.15', sortOrder: 27 },
  { grade: '5.15d', system: 'yds', numeric: 950, band: '5.15', sortOrder: 28 },
];

const ALL_GRADES: Record<GradeSystem, GradeDefinition[]> = {
  font: FONT_GRADES,
  french: FRENCH_GRADES,
  v_scale: V_SCALE_GRADES,
  yds: YDS_GRADES,
};

export function getGradesForSystem(system: GradeSystem): GradeDefinition[] {
  return ALL_GRADES[system];
}

export function getGradesByBand(system: GradeSystem, band: string): GradeDefinition[] {
  return ALL_GRADES[system].filter((g) => g.band === band);
}

export function getBands(system: GradeSystem): string[] {
  const bands: string[] = [];
  for (const g of ALL_GRADES[system]) {
    if (!bands.includes(g.band)) bands.push(g.band);
  }
  return bands;
}

export function gradeToNumeric(grade: string, system: GradeSystem): number | null {
  const found = ALL_GRADES[system].find((g) => g.grade === grade);
  return found?.numeric ?? null;
}

export function numericToGrade(numeric: number, system: GradeSystem): string | null {
  // Find the closest grade at or below the numeric value
  const grades = ALL_GRADES[system];
  let closest: GradeDefinition | null = null;
  for (const g of grades) {
    if (g.numeric <= numeric) {
      if (!closest || g.numeric > closest.numeric) closest = g;
    }
  }
  return closest?.grade ?? null;
}

/** Get a color for grade chips based on difficulty band */
export function getGradeColor(numeric: number): string {
  if (numeric < 400) return '#4CAF50'; // green - beginner
  if (numeric < 500) return '#8BC34A'; // light green
  if (numeric < 600) return '#FFC107'; // amber
  if (numeric < 700) return '#FF9800'; // orange
  if (numeric < 800) return '#F44336'; // red
  if (numeric < 900) return '#9C27B0'; // purple
  return '#212121'; // black - elite
}
