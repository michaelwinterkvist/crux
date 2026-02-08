import { z } from 'zod';
import { BOARD_TYPES } from '../constants/enums.js';

export const connectBoardSchema = z.object({
  boardType: z.enum(BOARD_TYPES),
  username: z.string().min(1).max(255),
  password: z.string().min(1).max(255),
});

export type ConnectBoardInput = z.infer<typeof connectBoardSchema>;

export interface BoardConnection {
  id: string;
  userId: string;
  boardType: string;
  username: string;
  boardUserId: string | null;
  lastSyncAt: string | null;
  syncEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ImportResult {
  sessionsCreated: number;
  ascentsImported: number;
  duplicatesSkipped: number;
}
