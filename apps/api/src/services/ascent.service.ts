import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { ascents } from '../db/schema/ascents.js';
import { sessions } from '../db/schema/sessions.js';
import type { CreateAscentInput, UpdateAscentInput } from '@crux/shared';
import { gradeToNumeric } from '@crux/shared';
import { badRequest, notFound } from '../utils/errors.js';

export async function listBySession(sessionId: string) {
  return db.select().from(ascents)
    .where(eq(ascents.sessionId, sessionId))
    .orderBy(ascents.sortOrder);
}

export async function create(userId: string, sessionId: string, input: CreateAscentInput) {
  // Verify session belongs to user
  const [session] = await db.select({ id: sessions.id }).from(sessions)
    .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)))
    .limit(1);
  if (!session) throw notFound('Session');

  const normalizedGrade = gradeToNumeric(input.grade, input.gradeSystem);
  if (normalizedGrade === null) throw badRequest(`Invalid grade '${input.grade}' for system '${input.gradeSystem}'`);

  // Get next sort order
  const [maxSort] = await db.select({
    max: sql<number>`coalesce(max(${ascents.sortOrder}), -1)`,
  }).from(ascents).where(eq(ascents.sessionId, sessionId));

  const [ascent] = await db.insert(ascents)
    .values({
      ...input,
      sessionId,
      normalizedGrade,
      sortOrder: (maxSort?.max ?? -1) + 1,
    })
    .returning();
  return ascent;
}

export async function update(userId: string, ascentId: string, input: UpdateAscentInput) {
  // Verify ascent belongs to user's session
  const [existing] = await db.select({
    ascentId: ascents.id,
    sessionUserId: sessions.userId,
  })
    .from(ascents)
    .innerJoin(sessions, eq(ascents.sessionId, sessions.id))
    .where(and(eq(ascents.id, ascentId), eq(sessions.userId, userId)))
    .limit(1);

  if (!existing) throw notFound('Ascent');

  let normalizedGrade: number | undefined;
  if (input.grade && input.gradeSystem) {
    const ng = gradeToNumeric(input.grade, input.gradeSystem);
    if (ng === null) throw badRequest(`Invalid grade '${input.grade}' for system '${input.gradeSystem}'`);
    normalizedGrade = ng;
  }

  const [ascent] = await db.update(ascents)
    .set({ ...input, ...(normalizedGrade !== undefined ? { normalizedGrade } : {}) })
    .where(eq(ascents.id, ascentId))
    .returning();
  return ascent;
}

export async function remove(userId: string, ascentId: string) {
  // Verify ownership
  const [existing] = await db.select({ ascentId: ascents.id })
    .from(ascents)
    .innerJoin(sessions, eq(ascents.sessionId, sessions.id))
    .where(and(eq(ascents.id, ascentId), eq(sessions.userId, userId)))
    .limit(1);

  if (!existing) throw notFound('Ascent');

  await db.delete(ascents).where(eq(ascents.id, ascentId));
}
