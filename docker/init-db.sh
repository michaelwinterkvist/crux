#!/bin/sh
# Run inside the builder container to push schema and seed grades
set -e

cd /app
echo "Pushing database schema..."
cd apps/api
npx drizzle-kit push --force
echo "Seeding grade conversions..."
npx tsx src/db/seed.ts
echo "Done!"
