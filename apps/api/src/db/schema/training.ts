import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { sessions } from './sessions.js';

export interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  duration?: number; // seconds
  rest?: number; // seconds
  weight?: number; // kg
  notes?: string;
}

export const trainingSessions = pgTable('training_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'cascade' }).notNull(),
  exercises: jsonb('exercises').$type<Exercise[]>().notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
