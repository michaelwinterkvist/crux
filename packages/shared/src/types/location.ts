import { z } from 'zod';
import { BOARD_TYPES, LOCATION_TYPES } from '../constants/enums.js';

export const createLocationSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(LOCATION_TYPES),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  notes: z.string().optional(),
  boardTypes: z.array(z.enum(BOARD_TYPES)).optional(),
});

export const updateLocationSchema = createLocationSchema.partial();

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;

export interface Location {
  id: string;
  userId: string;
  name: string;
  type: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  boardTypes: string[] | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}
