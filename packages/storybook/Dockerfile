# Build stage
FROM node:22-alpine AS builder

# Install build dependencies
RUN npm install -g pnpm@10.15.0

WORKDIR /app

# Copy package files for dependency resolution
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/storybook/package.json packages/storybook/
COPY packages/design-tokens/ packages/design-tokens/
COPY packages/ui-components/ packages/ui-components/
COPY packages/icons/ packages/icons/
COPY config/eslint/ config/eslint/
COPY config/tsconfig/ config/tsconfig/

# Install dependencies
RUN pnpm install --prefer-offline

# Copy source files
COPY packages/storybook packages/storybook
COPY packages/design-tokens packages/design-tokens
COPY packages/ui-components packages/ui-components

# Build Storybook
ENV NODE_ENV=production
RUN pnpm turbo run build --filter=@task-sync/storybook

# Production stage using official NGINX unprivileged image
FROM nginxinc/nginx-unprivileged:alpine-slim AS runner

# Copy custom nginx configuration for unprivileged setup
COPY packages/storybook/nginx.conf /etc/nginx/nginx.conf

# Copy built Storybook
COPY --from=builder /app/packages/storybook/storybook-static /usr/share/nginx/html

# The unprivileged image already exposes port 8080 by default
EXPOSE 8080

# Health check using the correct port
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start nginx (already configured to run as non-root)
CMD ["nginx", "-g", "daemon off;"]