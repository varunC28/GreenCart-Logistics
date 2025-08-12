# Root-level Dockerfile to build and run backend

# ---- Builder stage ----
FROM node:20-slim AS builder
WORKDIR /app/backend

# System deps for SSL
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Install deps
COPY backend/package*.json ./
RUN npm ci

# Prisma generate (needs schema)
COPY backend/prisma ./prisma
RUN npx prisma generate

# Build TypeScript
COPY backend/tsconfig.json ./tsconfig.json
COPY backend/src ./src
RUN npm run build

# ---- Runtime stage ----
FROM node:20-slim
WORKDIR /app/backend
ENV NODE_ENV=production

# System deps for SSL
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy runtime artifacts
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/prisma ./prisma
COPY --from=builder /app/backend/dist ./dist

EXPOSE 4000
CMD ["sh","-c","npx prisma migrate deploy || npx prisma db push && node dist/index.js"]
