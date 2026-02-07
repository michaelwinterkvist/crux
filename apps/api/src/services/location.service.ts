import { and, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { locations } from '../db/schema/locations.js';
import type { CreateLocationInput, UpdateLocationInput } from '@crux/shared';
import { notFound } from '../utils/errors.js';

export async function list(userId: string) {
  return db.select().from(locations)
    .where(and(eq(locations.userId, userId), eq(locations.isArchived, false)))
    .orderBy(locations.name);
}

export async function getById(userId: string, id: string) {
  const [location] = await db.select().from(locations)
    .where(and(eq(locations.id, id), eq(locations.userId, userId)))
    .limit(1);
  if (!location) throw notFound('Location');
  return location;
}

export async function create(userId: string, input: CreateLocationInput) {
  const [location] = await db.insert(locations)
    .values({ ...input, userId })
    .returning();
  return location;
}

export async function update(userId: string, id: string, input: UpdateLocationInput) {
  const [location] = await db.update(locations)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(locations.id, id), eq(locations.userId, userId)))
    .returning();
  if (!location) throw notFound('Location');
  return location;
}

export async function archive(userId: string, id: string) {
  const [location] = await db.update(locations)
    .set({ isArchived: true, updatedAt: new Date() })
    .where(and(eq(locations.id, id), eq(locations.userId, userId)))
    .returning();
  if (!location) throw notFound('Location');
  return location;
}
