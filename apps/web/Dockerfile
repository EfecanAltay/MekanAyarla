# Build stage
FROM node:20-bookworm-slim AS web-builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY apps/server/package.json ./apps/server/package.json

RUN npm install --os=linux --cpu=x64
RUN npm install \
    @rolldown/binding-linux-x64-gnu \
    lightningcss-linux-x64-gnu \
    @tailwindcss/oxide-linux-x64-gnu

COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

RUN npm run build -w web

# Runner stage
FROM nginx:stable-alpine AS runner

COPY --from=web-builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 90

CMD ["nginx", "-g", "daemon off;"]