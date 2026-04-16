# =========================
# Build stage
# =========================
FROM node:20-bookworm-slim AS server-builder

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/server/package.json ./apps/server/package.json
COPY apps/server/tsconfig.json ./apps/server/tsconfig.json
COPY apps/web/package.json ./apps/web/package.json

RUN npm install

COPY packages/shared ./packages/shared
COPY apps/server ./apps/server

RUN npm run build -w @mekanayarla/shared

WORKDIR /app/apps/server
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build

# =========================
# Runner stage
# =========================
FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=server-builder /app/package.json /app/package-lock.json ./
COPY --from=server-builder /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=server-builder /app/apps/server/package.json ./apps/server/package.json

RUN npm install --omit=dev

COPY --from=server-builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=server-builder /app/apps/server/dist ./apps/server/dist
COPY --from=server-builder /app/apps/server/prisma ./apps/server/prisma

COPY --from=server-builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=server-builder /app/node_modules/@prisma /app/node_modules/@prisma

EXPOSE 3000

WORKDIR /app/apps/server
CMD ["node", "dist/index.js"]