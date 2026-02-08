import { boolean, index, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const boardConnections = pgTable('board_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  boardType: varchar('board_type', { length: 30 }).notNull(),
  username: text('username').notNull(),
  encryptedPassword: text('encrypted_password').notNull(),
  boardUserId: varchar('board_user_id', { length: 100 }),
  lastSyncAt: timestamp('last_sync_at', { withTimezone: true }),
  syncEnabled: boolean('sync_enabled').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('board_connections_user_board_idx').on(table.userId, table.boardType),
  index('board_connections_user_idx').on(table.userId),
]);
