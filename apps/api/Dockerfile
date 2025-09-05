# Build stage
FROM node:22-alpine AS builder

# Install build dependencies in one layer
RUN npm install -g pnpm@10.15.0

WORKDIR /app

# Copy all necessary files for workspace resolution
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/
COPY packages/api-types/ packages/api-types/
COPY packages/email-templates/ packages/email-templates/
COPY packages/env/ packages/env/
COPY config/eslint/package.json config/eslint/
COPY config/tsconfig/ config/tsconfig/

# Install dependencies
RUN pnpm install --prefer-offline

COPY apps/api apps/api

# Build with optimizations
ENV NODE_ENV=production
RUN pnpm turbo run build --filter=@task-sync/api

# Production dependencies stage
FROM node:22-alpine AS deps

WORKDIR /app

RUN npm install -g pnpm@10.15.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/api-types/package.json packages/api-types/
COPY packages/email-templates/package.json packages/email-templates/
COPY packages/env/package.json packages/env/
COPY config/eslint/package.json config/eslint/
COPY config/tsconfig/package.json config/tsconfig/

# Install only production dependencies
RUN pnpm install --prod --prefer-offline --ignore-scripts

# Final production stage
FROM node:22-alpine AS runner

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init
RUN npm install -g pnpm@10.15.0

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json apps/api/package.json
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/src/infra/database/typeorm apps/api/src/infra/database/typeorm
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/src/infra/env apps/api/src/infra/env
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/tsconfig.production.json apps/api/tsconfig.json
COPY --from=builder --chown=nestjs:nodejs /app/packages/email-templates/dist packages/email-templates/dist
COPY --from=builder --chown=nestjs:nodejs /app/packages/email-templates/package.json packages/email-templates/package.json
COPY --from=builder --chown=nestjs:nodejs /app/packages/env/dist  packages/env/dist
COPY --from=builder --chown=nestjs:nodejs /app/packages/env/package.json  packages/env/package.json

# Copy production dependencies
COPY --from=deps --chown=nestjs:nodejs /app/node_modules node_modules
COPY --from=deps --chown=nestjs:nodejs /app/apps/api/node_modules apps/api/node_modules
COPY --from=deps --chown=nestjs:nodejs /app/packages/email-templates/node_modules packages/email-templates/node_modules
COPY --from=deps --chown=nestjs:nodejs /app/packages/env/node_modules packages/env/node_modules

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3333

# Health check with curl (lighter than wget)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3333/health || exit

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run migrations and start the application
CMD ["/bin/sh", "-c", "cd apps/api && pnpm migration:run && node dist/infra/main.js"]