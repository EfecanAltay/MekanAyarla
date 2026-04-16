# =========================
# Build stage
# =========================
FROM node:20-bookworm-slim AS server-builder

WORKDIR /app

# Root + workspace manifests
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/server/package.json ./apps/server/package.json
COPY apps/server/tsconfig.json ./apps/server/tsconfig.json
COPY apps/web/package.json ./apps/web/package.json

# Install all deps
RUN npm install

# Copy source
COPY packages/shared ./packages/shared
COPY apps/server ./apps/server

# Build shared package
RUN npm run build -w @mekanayarla/shared

# Build server
WORKDIR /app/apps/server
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build

# =========================
# Runner stage
# =========================
FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy manifests needed for prod install
COPY --from=server-builder /app/package.json /app/package-lock.json ./
COPY --from=server-builder /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=server-builder /app/apps/server/package.json ./apps/server/package.json

# Install production deps
RUN npm install --omit=dev

# Copy built artifacts
COPY --from=server-builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=server-builder /app/apps/server/dist ./apps/server/dist
COPY --from=server-builder /app/apps/server/prisma ./apps/server/prisma

# Copy generated Prisma client from builder
COPY --from=server-builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=server-builder /app/node_modules/@prisma /app/node_modules/@prisma

EXPOSE 3000

WORKDIR /app/apps/server
CMD ["node", "dist/index.js"]