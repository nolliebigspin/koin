FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN bun install --production

COPY packages/shared packages/shared
COPY apps/api/src apps/api/src

CMD ["bun", "run", "apps/api/src/index.ts"]
