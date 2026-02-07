import { jsonb, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import type { UserPreferences } from '@crux/shared';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  preferences: jsonb('preferences').$type<UserPreferences>().default({
    defaultGradeSystem: 'font',
    defaultSessionType: 'bouldering',
    units: 'metric',
  }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
