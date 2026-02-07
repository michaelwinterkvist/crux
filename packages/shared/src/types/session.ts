import { z } from 'zod';
import { SESSION_TYPES } from '../constants/enums.js';

export const createSessionSchema = z.object({
  locationId: z.string().uuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  type: z.enum(SESSION_TYPES),
  notes: z.string().optional(),
  moodBefore: z.number().int().min(1).max(5).optional(),
  moodAfter: z.number().int().min(1).max(5).optional(),
  energyLevel: z.number().int().min(1).max(5).optional(),
  perceivedExertion: z.number().int().min(1).max(10).optional(),
  isOutdoor: z.boolean().default(false),
});

export const updateSessionSchema = createSessionSchema.partial();

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;

export interface Session {
  id: string;
  userId: string;
  locationId: string | null;
  date: string;
  startTime: string | null;
  endTime: string | null;
  type: string;
  notes: string | null;
  moodBefore: number | null;
  moodAfter: number | null;
  energyLevel: number | null;
  perceivedExertion: number | null;
  isOutdoor: boolean;
  createdAt: string;
  updatedAt: string;
}
