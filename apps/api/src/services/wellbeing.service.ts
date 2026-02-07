import { and, eq, gte, lte, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { wellbeingLogs } from '../db/schema/wellbeing.js';
import type { CreateWellbeingInput } from '@crux/shared';
import { notFound } from '../utils/errors.js';

export async function upsert(userId: string, input: CreateWellbeingInput) {
  // Try to find existing entry for this date
  const [existing] = await db.select({ id: wellbeingLogs.id }).from(wellbeingLogs)
    .where(and(eq(wellbeingLogs.userId, userId), eq(wellbeingLogs.date, input.date)))
    .limit(1);

  if (existing) {
    const [log] = await db.update(wellbeingLogs)
      .set(input)
      .where(eq(wellbeingLogs.id, existing.id))
      .returning();
    return log;
  }

  const [log] = await db.insert(wellbeingLogs)
    .values({ ...input, userId })
    .returning();
  return log;
}

export async function list(userId: string, from?: string, to?: string) {
  const conditions = [eq(wellbeingLogs.userId, userId)];
  if (from) conditions.push(gte(wellbeingLogs.date, from));
  if (to) conditions.push(lte(wellbeingLogs.date, to));

  return db.select().from(wellbeingLogs)
    .where(and(...conditions))
    .orderBy(desc(wellbeingLogs.date));
}

export async function getByDate(userId: string, date: string) {
  const [log] = await db.select().from(wellbeingLogs)
    .where(and(eq(wellbeingLogs.userId, userId), eq(wellbeingLogs.date, date)))
    .limit(1);
  if (!log) throw notFound('Wellbeing log');
  return log;
}
