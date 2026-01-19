# Multi-stage build for optimal image size
#
# Build the image:
#   docker build -t forest-server .
#
# Run with environment variables:
#   docker run -p 3001:3001 \
#     -e DATABASE_URL="mongodb://..." \
#     -e JWT_SECRET="your-secret" \
#     -e JWT_REFRESH_SECRET="your-refresh-secret" \
#     -e GMAIL_USER="your-email@gmail.com" \
#     -e GMAIL_APP_PASSWORD="your-app-password" \
#     -e GEMINI_API_KEY="your-api-key" \
#     -e RAZORPAY_KEY_ID="your-key-id" \
#     -e RAZORPAY_KEY_SECRET="your-key-secret" \
#     -e RAZORPAY_WEBHOOK_SECRET="your-webhook-secret" \
#     -e FRONTEND_URL="http://localhost:3000" \
#     forest-server
#
# Or use an env file:
#   docker run -p 3001:3001 --env-file .env forest-server

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install && \
    npm cache clean --force

# Copy source code and config files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy package files
COPY package.json ./

# Install only production dependencies
RUN npm install --only=production && \
    npm cache clean --force

# Copy Prisma schema and generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built application
COPY --from=builder /app/dist ./dist

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port (default 3001, can be overridden via PORT env var)
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server
# Environment variables should be passed at runtime using -e or --env-file
CMD ["node", "dist/src/index.js"]
