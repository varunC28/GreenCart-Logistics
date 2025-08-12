# ---- Builder stage ----
FROM node:20-slim AS builder
WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Install deps
COPY package*.json ./
RUN npm ci

# Prisma generate (needs schema)
COPY prisma ./prisma
RUN npx prisma generate

# Build TypeScript
COPY tsconfig.json ./tsconfig.json
COPY src ./src
RUN npm run build

# ---- Runtime stage ----
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production

# Install runtime deps
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy runtime artifacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 4000

# Start command: run migrations (or push) then start server
CMD ["sh","-c","npx prisma migrate deploy || npx prisma db push && node dist/index.js"]
