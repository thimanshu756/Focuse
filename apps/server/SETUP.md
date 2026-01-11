# Server Setup & Running Guide

## Prerequisites

1. **Install dependencies:**

   ```bash
   cd apps/server
   pnpm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in `apps/server/` directory:

   ```bash
   PORT=3001
   NODE_ENV=development
   DATABASE_URL="mongodb://localhost:27017/forest"
   JWT_SECRET="your-secret-key-min-32-characters-long-please-make-it-secure"
   JWT_REFRESH_SECRET="your-refresh-secret-key-min-32-characters-long-secure"

   # Email Configuration (Gmail)
   GMAIL_USER="your-email@gmail.com"
   GMAIL_APP_PASSWORD="your-gmail-app-password"
   FRONTEND_URL="http://localhost:3000"

   # Optional
   REDIS_URL="redis://localhost:6379"
   LOG_LEVEL="info"
   ```

3. **Generate Prisma Client:**

   ```bash
   pnpm db:generate
   ```

4. **Set up database:**
   ```bash
   # Push schema to database (development)
   pnpm db:push
   ```

## Development Mode

**Run with hot reload (recommended for development):**

```bash
pnpm dev
```

This will:

- Start the server on `http://localhost:3001` (or PORT from .env)
- Watch for file changes and auto-restart
- Show detailed error messages

## Production Build & Run

### Step 1: Build the project

```bash
pnpm build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Step 2: Run the production server

```bash
pnpm start
```

This runs the compiled JavaScript from `dist/index.js`.

## Alternative: Run without building

You can also run TypeScript directly using `tsx`:

```bash
# Development
tsx src/index.ts

# Or use the dev script (recommended)
pnpm dev
```

## Verify Server is Running

1. **Check health endpoint:**

   ```bash
   curl http://localhost:3001/health
   ```

2. **Check API info:**

   ```bash
   curl http://localhost:3001/
   ```

3. **Test authentication endpoint:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "password": "TestPass123!"
     }'
   ```

## Common Commands

```bash
# Development
pnpm dev              # Start dev server with hot reload

# Production
pnpm build            # Build for production
pnpm start            # Run production server

# Database
pnpm db:generate       # Generate Prisma Client
pnpm db:push          # Push schema to database
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Prisma Studio (database GUI)

# Code Quality
pnpm type-check       # Type check without building
pnpm lint             # Run ESLint
```

## Troubleshooting

### Error: "Module '@prisma/client' has no exported member 'PrismaClient'"

**Solution:** Run `pnpm db:generate` to generate Prisma Client

### Error: "Environment validation failed"

**Solution:** Check your `.env` file has all required variables (see Prerequisites)

### Error: "Email transporter verification failed"

**Solution:**

- Verify Gmail credentials in `.env`
- Make sure you're using App Password (not regular password)
- Check 2-Step Verification is enabled

### Error: "Database connection failed"

**Solution:**

- Verify MongoDB is running
- Check `DATABASE_URL` in `.env` is correct
- Run `pnpm db:push` to set up database schema

## Port Configuration

Default port is `3001`. Change it in `.env`:

```bash
PORT=3001
```

The server will log the port on startup:

```
🚀 Server running on http://localhost:3001
📊 Health check: http://localhost:3001/health
```
