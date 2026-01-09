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
DATABASE_URL="postgresql://user:password@localhost:5432/forest?schema=public"
```

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
