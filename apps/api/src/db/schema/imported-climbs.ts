import { index, pgTable, smallint, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { ascents } from './ascents.js';

export const importedClimbs = pgTable('imported_climbs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  boardType: varchar('board_type', { length: 30 }).notNull(),
  boardClimbUuid: varchar('board_climb_uuid', { length: 100 }).notNull(),
  boardAngle: smallint('board_angle'),
  ascentId: uuid('ascent_id').references(() => ascents.id, { onDelete: 'cascade' }).notNull(),
  climbedAt: timestamp('climbed_at', { withTimezone: true }).notNull(),
  importedAt: timestamp('imported_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('imported_climbs_dedup_idx').on(table.userId, table.boardType, table.boardClimbUuid, table.boardAngle, table.climbedAt),
  index('imported_climbs_user_idx').on(table.userId),
  index('imported_climbs_ascent_idx').on(table.ascentId),
]);
