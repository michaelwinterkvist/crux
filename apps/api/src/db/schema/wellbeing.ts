import { date, doublePrecision, index, jsonb, pgTable, smallint, text, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const wellbeingLogs = pgTable('wellbeing_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  date: date('date').notNull(),
  sleepHours: doublePrecision('sleep_hours'),
  sleepQuality: smallint('sleep_quality'),
  fatigue: smallint('fatigue'),
  fingerHealth: smallint('finger_health'),
  skinCondition: smallint('skin_condition'),
  motivation: smallint('motivation'),
  stress: smallint('stress'),
  soreness: jsonb('soreness').$type<Record<string, number>>(),
  injuries: jsonb('injuries').$type<Array<{ area: string; severity: number; notes?: string }>>(),
  bodyWeight: doublePrecision('body_weight'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('wellbeing_user_date_idx').on(table.userId, table.date),
  unique('wellbeing_user_date_unique').on(table.userId, table.date),
]);
