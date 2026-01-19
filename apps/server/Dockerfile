FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json ./
RUN npm install && npm cache clean --force

COPY . .

RUN npx prisma generate
RUN npm run build


FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

COPY package.json ./
RUN npm install --only=production && npm cache clean --force

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist

RUN chown -R nodejs:nodejs /app
USER nodejs

# Koyeb will set PORT; keep your app listening on process.env.PORT
EXPOSE 8000

CMD ["node", "dist/src/index.js"]
