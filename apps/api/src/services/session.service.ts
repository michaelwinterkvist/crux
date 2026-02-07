import { and, desc, eq, gte, lte, sql, count } from 'drizzle-orm';
import { db } from '../db/index.js';
import { sessions } from '../db/schema/sessions.js';
import { ascents } from '../db/schema/ascents.js';
import { locations } from '../db/schema/locations.js';
import type { CreateSessionInput, UpdateSessionInput } from '@crux/shared';
import { notFound } from '../utils/errors.js';

interface ListOptions {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  type?: string;
  locationId?: string;
}

export async function list(userId: string, opts: ListOptions = {}) {
  const { page = 1, limit = 20, from, to, type, locationId } = opts;
  const offset = (page - 1) * limit;

  const conditions = [eq(sessions.userId, userId)];
  if (from) conditions.push(gte(sessions.date, from));
  if (to) conditions.push(lte(sessions.date, to));
  if (type) conditions.push(eq(sessions.type, type));
  if (locationId) conditions.push(eq(sessions.locationId, locationId));

  const where = and(...conditions);

  const [data, [{ total }]] = await Promise.all([
    db.select({
      id: sessions.id,
      userId: sessions.userId,
      locationId: sessions.locationId,
      locationName: locations.name,
      date: sessions.date,
      startTime: sessions.startTime,
      endTime: sessions.endTime,
      type: sessions.type,
      notes: sessions.notes,
      moodBefore: sessions.moodBefore,
      moodAfter: sessions.moodAfter,
      energyLevel: sessions.energyLevel,
      perceivedExertion: sessions.perceivedExertion,
      isOutdoor: sessions.isOutdoor,
      createdAt: sessions.createdAt,
      updatedAt: sessions.updatedAt,
      ascentCount: sql<number>`(SELECT count(*) FROM ascents WHERE ascents.session_id = ${sessions.id})`.as('ascent_count'),
      maxGrade: sql<number>`(SELECT max(normalized_grade) FROM ascents WHERE ascents.session_id = ${sessions.id})`.as('max_grade'),
    })
      .from(sessions)
      .leftJoin(locations, eq(sessions.locationId, locations.id))
      .where(where)
      .orderBy(desc(sessions.date))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(sessions).where(where),
  ]);

  return { data, meta: { page, limit, total } };
}

export async function getById(userId: string, id: string) {
  const [session] = await db.select({
    id: sessions.id,
    userId: sessions.userId,
    locationId: sessions.locationId,
    locationName: locations.name,
    date: sessions.date,
    startTime: sessions.startTime,
    endTime: sessions.endTime,
    type: sessions.type,
    notes: sessions.notes,
    moodBefore: sessions.moodBefore,
    moodAfter: sessions.moodAfter,
    energyLevel: sessions.energyLevel,
    perceivedExertion: sessions.perceivedExertion,
    isOutdoor: sessions.isOutdoor,
    createdAt: sessions.createdAt,
    updatedAt: sessions.updatedAt,
  })
    .from(sessions)
    .leftJoin(locations, eq(sessions.locationId, locations.id))
    .where(and(eq(sessions.id, id), eq(sessions.userId, userId)))
    .limit(1);

  if (!session) throw notFound('Session');

  const sessionAscents = await db.select().from(ascents)
    .where(eq(ascents.sessionId, id))
    .orderBy(ascents.sortOrder);

  return { ...session, ascents: sessionAscents };
}

function toDbValues(input: CreateSessionInput | UpdateSessionInput) {
  const values: Record<string, unknown> = { ...input };
  if (input.startTime) values.startTime = new Date(input.startTime);
  if (input.endTime) values.endTime = new Date(input.endTime);
  return values;
}

export async function create(userId: string, input: CreateSessionInput) {
  const [session] = await db.insert(sessions)
    .values({ ...toDbValues(input), userId } as typeof sessions.$inferInsert)
    .returning();
  return session;
}

export async function update(userId: string, id: string, input: UpdateSessionInput) {
  const [session] = await db.update(sessions)
    .set({ ...toDbValues(input), updatedAt: new Date() })
    .where(and(eq(sessions.id, id), eq(sessions.userId, userId)))
    .returning();
  if (!session) throw notFound('Session');
  return session;
}

export async function remove(userId: string, id: string) {
  const [session] = await db.delete(sessions)
    .where(and(eq(sessions.id, id), eq(sessions.userId, userId)))
    .returning({ id: sessions.id });
  if (!session) throw notFound('Session');
}
