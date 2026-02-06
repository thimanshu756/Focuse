FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy system files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json tsconfig.json ./

# Copy packages
COPY packages ./packages

# Copy app source
COPY apps/server ./apps/server

# Install dependencies (frozen lockfile)
RUN pnpm install --frozen-lockfile

# Build
WORKDIR /app/apps/server
RUN pnpm run db:generate
RUN pnpm run build

FROM base AS runner
WORKDIR /app
COPY --from=builder /app .

# Deploy production dependencies
# This creates a pruned node_modules with only prod deps for 'server'
RUN pnpm --filter=server --prod deploy /app/deployed

FROM base AS final
WORKDIR /app
ENV NODE_ENV=production

# Don't run as root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy the deployed dependencies and package source
COPY --from=runner --chown=nodejs:nodejs /app/deployed ./

# Copy the built artifacts (dist) from builder
# Ensure we copy from the right location. Builder worked in /app/apps/server
COPY --from=builder --chown=nodejs:nodejs /app/apps/server/dist ./dist

# Copy prisma directory if needed for migrations
COPY --from=builder --chown=nodejs:nodejs /app/apps/server/prisma ./prisma

# Copy the generated Prisma client from the builder stage
# The pnpm deploy preserves the .pnpm structure, so we must copy .prisma 
# to the exact location where @prisma/client looks for it
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/.pnpm/@prisma+client@6.19.2_prisma@6.19.2_typescript@5.9.3/node_modules/.prisma ./node_modules/.pnpm/@prisma+client@6.19.2_prisma@6.19.2_typescript@5.9.3/node_modules/.prisma

# Create logs directory with proper permissions for winston
RUN mkdir -p logs && chown nodejs:nodejs logs

USER nodejs
EXPOSE 8080

# Start server
CMD ["node", "dist/index.js"]
