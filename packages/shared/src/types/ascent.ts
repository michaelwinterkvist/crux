import { z } from 'zod';
import { ASCENT_RESULTS, ASCENT_STYLES, BOARD_TYPES, GRADE_SYSTEMS, HOLD_TYPES, WALL_ANGLES } from '../constants/enums.js';

export const createAscentSchema = z.object({
  name: z.string().max(255).optional(),
  grade: z.string().min(1).max(20),
  gradeSystem: z.enum(GRADE_SYSTEMS),
  style: z.enum(ASCENT_STYLES),
  attempts: z.number().int().min(1).default(1),
  result: z.enum(ASCENT_RESULTS),
  wallAngle: z.enum(WALL_ANGLES).optional(),
  holdTypes: z.array(z.enum(HOLD_TYPES)).optional(),
  notes: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  boardType: z.enum(BOARD_TYPES).optional(),
  boardAngle: z.number().int().min(0).max(70).optional(),
  boardClimbUuid: z.string().max(100).optional(),
  boardClimbUrl: z.string().url().optional(),
});

export const updateAscentSchema = createAscentSchema.partial();

export type CreateAscentInput = z.infer<typeof createAscentSchema>;
export type UpdateAscentInput = z.infer<typeof updateAscentSchema>;

export interface Ascent {
  id: string;
  sessionId: string;
  name: string | null;
  grade: string;
  gradeSystem: string;
  normalizedGrade: number;
  style: string;
  attempts: number;
  result: string;
  wallAngle: string | null;
  holdTypes: string[] | null;
  notes: string | null;
  rating: number | null;
  boardType: string | null;
  boardAngle: number | null;
  boardClimbUuid: string | null;
  boardClimbUrl: string | null;
  sortOrder: number;
  createdAt: string;
}
