import { boolean, date, index, pgTable, smallint, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { locations } from './locations.js';

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  locationId: uuid('location_id').references(() => locations.id, { onDelete: 'set null' }),
  date: date('date').notNull(),
  startTime: timestamp('start_time', { withTimezone: true }),
  endTime: timestamp('end_time', { withTimezone: true }),
  type: varchar('type', { length: 50 }).notNull(),
  notes: text('notes'),
  moodBefore: smallint('mood_before'),
  moodAfter: smallint('mood_after'),
  energyLevel: smallint('energy_level'),
  perceivedExertion: smallint('perceived_exertion'),
  isOutdoor: boolean('is_outdoor').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('sessions_user_date_idx').on(table.userId, table.date),
  index('sessions_location_idx').on(table.locationId),
]);
