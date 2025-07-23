# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy necessary monorepo files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .env* ./
COPY apps/api/package.json apps/api/
COPY packages/ packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy only the backend code and shared packages
COPY apps/api/ apps/api/
COPY packages/ packages/
COPY config/ config/

# Build the backend using Turborepo
RUN pnpm turbo run build --filter=@task-sync/api

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy compiled artifacts and package.json
COPY --from=builder /app/apps/api/dist/ ./apps/api/dist/
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/packages/ ./packages/
COPY --from=builder /app/config/ ./config/
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/package.json ./

# Install pnpm
RUN npm install -g pnpm@10.12.3

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# Create non-root user for enhanced security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose the configured port
EXPOSE 3333

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s CMD wget --no-verbose --tries=1 --spider http://localhost:3333/health || exit 1

# Start the application
CMD ["node", "apps/api/dist/main.js"]