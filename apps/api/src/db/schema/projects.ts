import { date, index, integer, pgTable, smallint, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { locations } from './locations.js';
import { ascents } from './ascents.js';
import { sessions } from './sessions.js';

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  grade: varchar('grade', { length: 20 }),
  gradeSystem: varchar('grade_system', { length: 30 }),
  normalizedGrade: integer('normalized_grade'),
  locationId: uuid('location_id').references(() => locations.id, { onDelete: 'set null' }),
  type: varchar('type', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  targetDate: date('target_date'),
  notes: text('notes'),
  sentDate: date('sent_date'),
  sentAscentId: uuid('sent_ascent_id').references(() => ascents.id, { onDelete: 'set null' }),
  boardType: varchar('board_type', { length: 30 }),
  boardClimbUuid: varchar('board_climb_uuid', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('projects_user_status_idx').on(table.userId, table.status),
]);

export const projectAttempts = pgTable('project_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'set null' }),
  ascentId: uuid('ascent_id').references(() => ascents.id, { onDelete: 'set null' }),
  date: date('date').notNull(),
  notes: text('notes'),
  progressRating: smallint('progress_rating'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('project_attempts_project_idx').on(table.projectId),
]);
