import { index, integer, pgTable, serial, smallint, unique, varchar } from 'drizzle-orm/pg-core';

export const gradeConversions = pgTable('grade_conversions', {
  id: serial('id').primaryKey(),
  system: varchar('system', { length: 30 }).notNull(),
  grade: varchar('grade', { length: 20 }).notNull(),
  numericValue: integer('numeric_value').notNull(),
  sortOrder: smallint('sort_order').notNull(),
}, (table) => [
  unique('grade_conversions_system_grade').on(table.system, table.grade),
  index('grade_conversions_numeric_idx').on(table.numericValue),
]);
