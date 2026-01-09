# Forest Server

Express.js API server for the Forest Focus Timer application.

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
# Start development server with hot reload
pnpm dev

# Type check
pnpm type-check

# Build for production
pnpm build

# Start production server
pnpm start
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
PORT=3001
NODE_ENV=development
DATABASE_URL="mongodb://localhost:27017/forest"
JWT_SECRET="your-secret-key-min-32-characters-long"
JWT_REFRESH_SECRET="your-refresh-secret-key-min-32-characters-long"

# Email Configuration (Gmail)
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-gmail-app-password"
FRONTEND_URL="http://localhost:3000"
```

### Gmail App Password Setup

To use Gmail for sending emails, you need to create an App Password:

1. Go to your Google Account settings
2. Enable 2-Step Verification (required for App Passwords)
3. Go to Security → 2-Step Verification → App passwords
4. Generate a new app password for "Mail"
5. Use the generated 16-character password as `GMAIL_APP_PASSWORD`

**Note:** Use your Gmail address as `GMAIL_USER` and the app password (not your regular Gmail password).

## Database Setup

### Prisma Commands

```bash
# Generate Prisma Client
pnpm db:generate

# Push schema changes to database (development)
pnpm db:push

# Create and run migrations
pnpm db:migrate

# Deploy migrations (production)
pnpm db:migrate:deploy

# Open Prisma Studio (database GUI)
pnpm db:studio
```

### First Time Setup

1. Set up your database (PostgreSQL recommended)
2. Configure `DATABASE_URL` in `.env`
3. Generate Prisma Client: `pnpm db:generate`
4. Push schema to database: `pnpm db:push`

## API Endpoints

- `GET /` - API information
- `GET /health` - Health check endpoint

## Tech Stack

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma ORM** - Database toolkit and ORM
- **PostgreSQL** - Database (default, configurable)
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables
