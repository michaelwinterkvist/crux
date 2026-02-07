import { z } from 'zod';
import { GRADE_SYSTEMS } from '../constants/enums.js';

export const userPreferencesSchema = z.object({
  defaultGradeSystem: z.enum(GRADE_SYSTEMS).default('font'),
  defaultSessionType: z.string().default('bouldering'),
  units: z.enum(['metric', 'imperial']).default('metric'),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export interface User {
  id: string;
  email: string;
  name: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}
