FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* .npmrc ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile || pnpm install

# Copy source
COPY packages/shared/ ./packages/shared/
COPY apps/api/ ./apps/api/
COPY tsconfig.base.json ./

# Build
RUN pnpm --filter @crux/shared build && pnpm --filter @crux/api build

WORKDIR /app/apps/api

EXPOSE 3000

# Push schema + seed grades on every startup, then run app
CMD ["sh", "-c", "npx drizzle-kit push --force 2>&1 && npx tsx src/db/seed.ts 2>&1 && node dist/index.js"]
