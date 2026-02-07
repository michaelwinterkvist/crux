import { z } from 'zod';
import { BOARD_TYPES, GRADE_SYSTEMS, PROJECT_STATUSES, PROJECT_TYPES } from '../constants/enums.js';

export const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  grade: z.string().max(20).optional(),
  gradeSystem: z.enum(GRADE_SYSTEMS).optional(),
  locationId: z.string().uuid().optional(),
  type: z.enum(PROJECT_TYPES),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().optional(),
  boardType: z.enum(BOARD_TYPES).optional(),
  boardClimbUuid: z.string().max(100).optional(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  status: z.enum(PROJECT_STATUSES).optional(),
  sentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sentAscentId: z.string().uuid().optional(),
});

export const createProjectAttemptSchema = z.object({
  sessionId: z.string().uuid().optional(),
  ascentId: z.string().uuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().optional(),
  progressRating: z.number().int().min(1).max(5).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateProjectAttemptInput = z.infer<typeof createProjectAttemptSchema>;

export interface Project {
  id: string;
  userId: string;
  name: string;
  grade: string | null;
  gradeSystem: string | null;
  normalizedGrade: number | null;
  locationId: string | null;
  type: string;
  status: string;
  targetDate: string | null;
  notes: string | null;
  sentDate: string | null;
  sentAscentId: string | null;
  boardType: string | null;
  boardClimbUuid: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectAttempt {
  id: string;
  projectId: string;
  sessionId: string | null;
  ascentId: string | null;
  date: string;
  notes: string | null;
  progressRating: number | null;
  createdAt: string;
}
