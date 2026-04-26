# Build TypeScript and production dependencies separately so devDependencies
# (typescript, etc.) are available only in the builder stage.
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---

FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
# Match EXPOSE; override at runtime if your platform sets PORT
ENV PORT=8080

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
# migrate.ts and dist/database/migrate.js read SQL from this path
COPY --from=builder /app/src/database/migrations ./src/database/migrations

EXPOSE 8080

CMD ["node", "dist/index.ts"]
