FROM oven/bun:1-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

FROM base AS builder
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM base AS runner
ENV NODE_ENV=production

USER bun

COPY --from=builder --chown=bun:bun /app/dist ./dist
COPY --from=deps --chown=bun:bun /app/node_modules ./node_modules

EXPOSE 4321
ENV PORT=4321
ENV HOST=0.0.0.0

CMD ["bun", "run", "dist/server/entry.mjs"]
