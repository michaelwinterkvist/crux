import { and, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { sessions } from '../db/schema/sessions.js';
import { ascents } from '../db/schema/ascents.js';
import { importedClimbs } from '../db/schema/imported-climbs.js';
import { kilterDifficultyToVGrade, kilterDifficultyToNumeric } from '@crux/shared';
import type { ImportResult } from '@crux/shared';
import * as kilterService from './kilter.service.js';
import * as boardConnectionService from './board-connection.service.js';

export async function importKilterHistory(
  userId: string,
  connectionId: string,
): Promise<ImportResult> {
  // Get connection and decrypt credentials
  const connection = await boardConnectionService.getById(userId, connectionId);
  const password = boardConnectionService.getDecryptedPassword(connection);

  // Authenticate with Kilter
  const kilterSession = await kilterService.authenticate(connection.username, password);

  // Fetch ascents and climbs together (incremental if we've synced before)
  const since = connection.lastSyncAt ?? undefined;
  const syncData = await kilterService.fetchAscentsAndClimbs(kilterSession.token, since ?? undefined);
  const kilterAscents = syncData.ascents;

  // Build climb name lookup
  const climbMap = new Map<string, kilterService.KilterClimb>();
  for (const climb of syncData.climbs) {
    climbMap.set(climb.uuid, climb);
  }

  // Filter already-imported
  const newAscents: kilterService.KilterAscent[] = [];
  let duplicatesSkipped = 0;

  for (const ascent of kilterAscents) {
    const alreadyImported = await isImported(
      userId,
      'kilter',
      ascent.climb_uuid,
      ascent.angle,
      new Date(ascent.climbed_at),
    );
    if (alreadyImported) {
      duplicatesSkipped++;
    } else {
      newAscents.push(ascent);
    }
  }

  // Group by date
  const byDate = groupByDate(newAscents);

  let sessionsCreated = 0;
  let ascentsImported = 0;

  // Create sessions + ascents for each date
  for (const [dateStr, dateAscents] of byDate) {
    const sessionId = await createSessionWithAscents(userId, dateStr, dateAscents, climbMap);
    if (sessionId) {
      sessionsCreated++;
      ascentsImported += dateAscents.length;
    }
  }

  // Update lastSyncAt
  await boardConnectionService.updateLastSync(connectionId);

  // Update boardUserId if not set
  if (!connection.boardUserId && kilterSession.userId) {
    // Store the Kilter user ID for future reference
  }

  return { sessionsCreated, ascentsImported, duplicatesSkipped };
}

async function isImported(
  userId: string,
  boardType: string,
  climbUuid: string,
  angle: number,
  climbedAt: Date,
): Promise<boolean> {
  const [existing] = await db.select({ id: importedClimbs.id })
    .from(importedClimbs)
    .where(and(
      eq(importedClimbs.userId, userId),
      eq(importedClimbs.boardType, boardType),
      eq(importedClimbs.boardClimbUuid, climbUuid),
      eq(importedClimbs.boardAngle, angle),
      eq(importedClimbs.climbedAt, climbedAt),
    ))
    .limit(1);
  return !!existing;
}

function groupByDate(ascents: kilterService.KilterAscent[]): Map<string, kilterService.KilterAscent[]> {
  const map = new Map<string, kilterService.KilterAscent[]>();
  for (const ascent of ascents) {
    // Extract date portion (YYYY-MM-DD) from climbed_at
    const date = ascent.climbed_at.slice(0, 10);
    const list = map.get(date) ?? [];
    list.push(ascent);
    map.set(date, list);
  }
  return map;
}

async function createSessionWithAscents(
  userId: string,
  dateStr: string,
  kilterAscents: kilterService.KilterAscent[],
  climbMap: Map<string, kilterService.KilterClimb>,
): Promise<string | null> {
  if (kilterAscents.length === 0) return null;

  // Check if a session already exists for this date (to append ascents)
  const [existingSession] = await db.select({ id: sessions.id })
    .from(sessions)
    .where(and(
      eq(sessions.userId, userId),
      eq(sessions.date, dateStr),
      eq(sessions.type, 'bouldering'),
    ))
    .limit(1);

  let sessionId: string;

  if (existingSession) {
    sessionId = existingSession.id;
  } else {
    const [newSession] = await db.insert(sessions)
      .values({
        userId,
        date: dateStr,
        type: 'bouldering',
        notes: 'Imported from Kilter Board',
        isOutdoor: false,
      })
      .returning({ id: sessions.id });
    sessionId = newSession.id;
  }

  // Create ascents
  for (let i = 0; i < kilterAscents.length; i++) {
    const ka = kilterAscents[i];
    const climb = climbMap.get(ka.climb_uuid);
    const vGrade = kilterDifficultyToVGrade(ka.difficulty);
    const numeric = kilterDifficultyToNumeric(ka.difficulty);

    const [ascent] = await db.insert(ascents)
      .values({
        sessionId,
        name: climb?.name ?? null,
        grade: vGrade,
        gradeSystem: 'v_scale',
        normalizedGrade: numeric,
        style: ka.bid_count <= 1 ? 'flash' : 'redpoint',
        attempts: ka.bid_count || 1,
        result: 'send',
        boardType: 'kilter',
        boardAngle: ka.angle,
        boardClimbUuid: ka.climb_uuid,
        boardClimbUrl: kilterService.buildClimbUrl(ka.climb_uuid),
        notes: ka.comment || null,
        sortOrder: i,
      })
      .returning({ id: ascents.id });

    // Track import
    await db.insert(importedClimbs).values({
      userId,
      boardType: 'kilter',
      boardClimbUuid: ka.climb_uuid,
      boardAngle: ka.angle,
      ascentId: ascent.id,
      climbedAt: new Date(ka.climbed_at),
    });
  }

  return sessionId;
}
