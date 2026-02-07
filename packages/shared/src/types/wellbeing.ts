import { z } from 'zod';

export const createWellbeingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sleepHours: z.number().min(0).max(24).optional(),
  sleepQuality: z.number().int().min(1).max(5).optional(),
  fatigue: z.number().int().min(1).max(5).optional(),
  fingerHealth: z.number().int().min(1).max(5).optional(),
  skinCondition: z.number().int().min(1).max(5).optional(),
  motivation: z.number().int().min(1).max(5).optional(),
  stress: z.number().int().min(1).max(5).optional(),
  soreness: z.record(z.string(), z.number().int().min(1).max(5)).optional(),
  injuries: z.array(z.object({
    area: z.string(),
    severity: z.number().int().min(1).max(5),
    notes: z.string().optional(),
  })).optional(),
  bodyWeight: z.number().positive().optional(),
  notes: z.string().optional(),
});

export type CreateWellbeingInput = z.infer<typeof createWellbeingSchema>;

export interface WellbeingLog {
  id: string;
  userId: string;
  date: string;
  sleepHours: number | null;
  sleepQuality: number | null;
  fatigue: number | null;
  fingerHealth: number | null;
  skinCondition: number | null;
  motivation: number | null;
  stress: number | null;
  soreness: Record<string, number> | null;
  injuries: Array<{ area: string; severity: number; notes?: string }> | null;
  bodyWeight: number | null;
  notes: string | null;
  createdAt: string;
}
