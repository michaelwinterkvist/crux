import { index, integer, jsonb, pgTable, smallint, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { sessions } from './sessions.js';

export const ascents = pgTable('ascents', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }),
  grade: varchar('grade', { length: 20 }).notNull(),
  gradeSystem: varchar('grade_system', { length: 30 }).notNull(),
  normalizedGrade: integer('normalized_grade').notNull(),
  style: varchar('style', { length: 30 }).notNull(),
  attempts: smallint('attempts').default(1).notNull(),
  result: varchar('result', { length: 20 }).notNull(),
  wallAngle: varchar('wall_angle', { length: 30 }),
  holdTypes: jsonb('hold_types').$type<string[]>(),
  notes: text('notes'),
  rating: smallint('rating'),
  boardType: varchar('board_type', { length: 30 }),
  boardAngle: smallint('board_angle'),
  boardClimbUuid: varchar('board_climb_uuid', { length: 100 }),
  boardClimbUrl: text('board_climb_url'),
  sortOrder: smallint('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('ascents_session_idx').on(table.sessionId),
  index('ascents_normalized_grade_idx').on(table.normalizedGrade),
  index('ascents_board_type_idx').on(table.boardType),
]);
