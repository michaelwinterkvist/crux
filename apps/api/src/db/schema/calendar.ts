import { date, index, jsonb, pgTable, text, time, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { locations } from './locations.js';

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  daysOfWeek?: number[]; // 0=Sun, 1=Mon, etc.
  endDate?: string;
}

export const calendarEvents = pgTable('calendar_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  date: date('date').notNull(),
  startTime: time('start_time'),
  endTime: time('end_time'),
  locationId: uuid('location_id').references(() => locations.id, { onDelete: 'set null' }),
  notes: text('notes'),
  recurringPattern: jsonb('recurring_pattern').$type<RecurringPattern>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('calendar_events_user_date_idx').on(table.userId, table.date),
]);
