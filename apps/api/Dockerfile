FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@10.15.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/
COPY packages/api-types packages/api-types
COPY packages/email-templates packages/email-templates
COPY packages/env packages/env
COPY config/ config/

RUN pnpm install --prefer-offline

COPY apps/api apps/api

ENV NODE_ENV=production
RUN pnpm turbo run build --filter=@task-sync/api --no-daemon

FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache dumb-init curl && \
  npm install -g pnpm@10.15.0

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json apps/api/
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/src/infra/database/typeorm apps/api/src/infra/database/typeorm
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/src/infra/env apps/api/src/infra/env
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/tsconfig.production.json apps/api/tsconfig.json

COPY --from=builder --chown=nestjs:nodejs /app/packages/email-templates/dist packages/email-templates/dist
COPY --from=builder --chown=nestjs:nodejs /app/packages/email-templates/package.json packages/email-templates/
COPY --from=builder --chown=nestjs:nodejs /app/packages/env/dist packages/env/dist
COPY --from=builder --chown=nestjs:nodejs /app/packages/env/package.json packages/env/

COPY --from=builder --chown=nestjs:nodejs /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./

RUN pnpm install --prod --frozen-lockfile --prefer-offline --ignore-scripts && \
  pnpm store prune && \
  rm -rf ~/.pnpm-store

USER nestjs

EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3333/health || exit 1

ENTRYPOINT ["dumb-init", "--"]

CMD ["/bin/sh", "-c", "cd apps/api && pnpm migration:run && node dist/infra/main.js"]