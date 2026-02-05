FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm run db:generate
RUN pnpm run build:server

FROM base AS runner
WORKDIR /app
COPY --from=builder /app .
# Use deploy to isolate the server package and its production dependencies
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
# We assume the build output is in apps/server/dist
COPY --from=builder --chown=nodejs:nodejs /app/apps/server/dist ./dist

# Copy prisma directory if needed for migrations (optional in production request, but good for reference)
COPY --from=builder --chown=nodejs:nodejs /app/apps/server/prisma ./prisma

USER nodejs
EXPOSE 8000

# Start server
CMD ["node", "dist/index.js"]
