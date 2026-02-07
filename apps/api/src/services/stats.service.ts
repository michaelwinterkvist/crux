import { and, count, desc, eq, gte, lte, max, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { sessions } from '../db/schema/sessions.js';
import { ascents } from '../db/schema/ascents.js';

export async function summary(userId: string) {
  const [sessionStats] = await db.select({
    totalSessions: count(),
  }).from(sessions).where(eq(sessions.userId, userId));

  const [ascentStats] = await db.select({
    totalAscents: count(),
    totalSends: sql<number>`count(*) filter (where ${ascents.result} = 'send')`,
    highestGrade: max(ascents.normalizedGrade),
  })
    .from(ascents)
    .innerJoin(sessions, eq(ascents.sessionId, sessions.id))
    .where(eq(sessions.userId, userId));

  // This month's stats
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStr = monthStart.toISOString().slice(0, 10);

  const [monthStats] = await db.select({
    sessionsThisMonth: count(),
  }).from(sessions)
    .where(and(eq(sessions.userId, userId), gte(sessions.date, monthStr)));

  const [monthAscentStats] = await db.select({
    ascentsThisMonth: count(),
    highestGradeThisMonth: max(ascents.normalizedGrade),
  })
    .from(ascents)
    .innerJoin(sessions, eq(ascents.sessionId, sessions.id))
    .where(and(
      eq(sessions.userId, userId),
      gte(sessions.date, monthStr),
      eq(ascents.result, 'send'),
    ));

  return {
    totalSessions: sessionStats.totalSessions,
    totalAscents: ascentStats.totalAscents,
    totalSends: ascentStats.totalSends,
    highestGrade: ascentStats.highestGrade,
    sessionsThisMonth: monthStats.sessionsThisMonth,
    ascentsThisMonth: monthAscentStats.ascentsThisMonth,
    highestGradeThisMonth: monthAscentStats.highestGradeThisMonth,
  };
}

export async function progression(userId: string, from?: string, to?: string) {
  const conditions = [
    eq(sessions.userId, userId),
    eq(ascents.result, 'send'),
  ];
  if (from) conditions.push(gte(sessions.date, from));
  if (to) conditions.push(lte(sessions.date, to));

  // Max grade per session date
  const data = await db.select({
    date: sessions.date,
    maxGrade: max(ascents.normalizedGrade),
    sendCount: count(),
  })
    .from(ascents)
    .innerJoin(sessions, eq(ascents.sessionId, sessions.id))
    .where(and(...conditions))
    .groupBy(sessions.date)
    .orderBy(sessions.date);

  return data;
}
