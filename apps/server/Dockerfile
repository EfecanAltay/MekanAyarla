# Build stage
FROM node:20-bookworm-slim AS server-builder

WORKDIR /app

# Dependency manifests
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/server/package.json ./apps/server/package.json
COPY apps/web/package.json ./apps/web/package.json

# Install all dependencies
RUN npm install

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/server/ ./apps/server/

# Build shared package
RUN npm run build -w @mekanayarla/shared

# Generate Prisma client and build server
WORKDIR /app/apps/server
RUN npx prisma generate
RUN npm run build

# Runner stage
FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package manifests
COPY --from=server-builder /app/package.json /app/package-lock.json ./
COPY --from=server-builder /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=server-builder /app/apps/server/package.json ./apps/server/package.json

# Copy built artifacts
COPY --from=server-builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=server-builder /app/apps/server/dist ./apps/server/dist
COPY --from=server-builder /app/apps/server/prisma ./apps/server/prisma

# Install only production dependencies
RUN npm install --omit=dev

EXPOSE 3000

WORKDIR /app/apps/server
CMD ["node", "dist/index.js"]