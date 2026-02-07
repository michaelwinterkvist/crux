import { and, eq, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { projects, projectAttempts } from '../db/schema/projects.js';
import type { CreateProjectInput, UpdateProjectInput, CreateProjectAttemptInput } from '@crux/shared';
import { gradeToNumeric } from '@crux/shared';
import { notFound } from '../utils/errors.js';

export async function list(userId: string, status?: string) {
  const conditions = [eq(projects.userId, userId)];
  if (status) conditions.push(eq(projects.status, status));

  return db.select().from(projects)
    .where(and(...conditions))
    .orderBy(desc(projects.updatedAt));
}

export async function getById(userId: string, id: string) {
  const [project] = await db.select().from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))
    .limit(1);
  if (!project) throw notFound('Project');

  const attempts = await db.select().from(projectAttempts)
    .where(eq(projectAttempts.projectId, id))
    .orderBy(desc(projectAttempts.date));

  return { ...project, attempts };
}

export async function create(userId: string, input: CreateProjectInput) {
  let normalizedGrade: number | null = null;
  if (input.grade && input.gradeSystem) {
    normalizedGrade = gradeToNumeric(input.grade, input.gradeSystem);
  }

  const [project] = await db.insert(projects)
    .values({ ...input, userId, normalizedGrade })
    .returning();
  return project;
}

export async function update(userId: string, id: string, input: UpdateProjectInput) {
  let normalizedGrade: number | null | undefined;
  if (input.grade !== undefined && input.gradeSystem) {
    normalizedGrade = input.grade ? gradeToNumeric(input.grade, input.gradeSystem) : null;
  }

  const values: Record<string, unknown> = { ...input, updatedAt: new Date() };
  if (normalizedGrade !== undefined) values.normalizedGrade = normalizedGrade;

  const [project] = await db.update(projects)
    .set(values)
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))
    .returning();
  if (!project) throw notFound('Project');
  return project;
}

export async function remove(userId: string, id: string) {
  const [project] = await db.delete(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))
    .returning({ id: projects.id });
  if (!project) throw notFound('Project');
}

export async function addAttempt(userId: string, projectId: string, input: CreateProjectAttemptInput) {
  // Verify project belongs to user
  const [project] = await db.select({ id: projects.id }).from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);
  if (!project) throw notFound('Project');

  const [attempt] = await db.insert(projectAttempts)
    .values({ ...input, projectId })
    .returning();
  return attempt;
}

export async function listAttempts(userId: string, projectId: string) {
  // Verify project belongs to user
  const [project] = await db.select({ id: projects.id }).from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);
  if (!project) throw notFound('Project');

  return db.select().from(projectAttempts)
    .where(eq(projectAttempts.projectId, projectId))
    .orderBy(desc(projectAttempts.date));
}
