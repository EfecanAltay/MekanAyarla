FROM node:20-bookworm-slim AS server-builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/server/package.json ./apps/server/package.json
COPY apps/web/package.json ./apps/web/package.json

RUN npm install

COPY packages/shared ./packages/shared
COPY apps/server ./apps/server

RUN npm run build -w @mekanayarla/shared

WORKDIR /app/apps/server
RUN npx prisma generate
RUN npm run build
RUN find /app/apps/server -maxdepth 4 -type f | sort

FROM node:20-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=server-builder /app/package.json /app/package-lock.json ./
COPY --from=server-builder /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=server-builder /app/apps/server/package.json ./apps/server/package.json

COPY --from=server-builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=server-builder /app/apps/server/dist ./apps/server/dist
COPY --from=server-builder /app/apps/server/prisma ./apps/server/prisma

RUN npm install --omit=dev

WORKDIR /app/apps/server
CMD ["node", "dist/src/index.js"]