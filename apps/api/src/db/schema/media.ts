import { index, integer, jsonb, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { ascents } from './ascents.js';
import { sessions } from './sessions.js';

export interface Annotation {
  timestamp?: number; // seconds, for video
  text: string;
  x?: number; // 0-1 normalized position
  y?: number;
}

export const media = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  ascentId: uuid('ascent_id').references(() => ascents.id, { onDelete: 'set null' }),
  sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'set null' }),
  type: varchar('type', { length: 20 }).notNull(),
  filePath: text('file_path').notNull(),
  thumbnailPath: text('thumbnail_path'),
  mimeType: varchar('mime_type', { length: 100 }),
  fileSize: integer('file_size'),
  annotations: jsonb('annotations').$type<Annotation[]>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('media_ascent_idx').on(table.ascentId),
  index('media_session_idx').on(table.sessionId),
]);
