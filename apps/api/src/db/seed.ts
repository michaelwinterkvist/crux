import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { gradeConversions } from './schema/grades.js';
import { FONT_GRADES, FRENCH_GRADES, V_SCALE_GRADES, YDS_GRADES } from '@crux/shared';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const client = postgres(url);
const db = drizzle(client);

async function seed() {
  console.log('Seeding grade conversions...');

  const allGrades = [...FONT_GRADES, ...FRENCH_GRADES, ...V_SCALE_GRADES, ...YDS_GRADES];

  const values = allGrades.map((g) => ({
    system: g.system,
    grade: g.grade,
    numericValue: g.numeric,
    sortOrder: g.sortOrder,
  }));

  // Upsert: insert or skip on conflict
  await db.insert(gradeConversions).values(values).onConflictDoNothing();

  console.log(`Seeded ${values.length} grade conversions.`);
  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
