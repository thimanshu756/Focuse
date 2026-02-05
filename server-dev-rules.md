# Backend Development Rules - Focus Timer App

# Stack: Node.js + Express + TypeScript + Prisma + MongoDB

## ARCHITECTURE: THREE-LAYER PATTERN (MANDATORY)

### Layer 1: Routes (routes/\*.ts)

- Define endpoints + apply middleware
- NO business logic, NO database queries

```typescript
router.post(
  '/',
  authenticate,
  rateLimiter,
  validateRequest(schema),
  controller.method
);
```

### Layer 2: Controllers (controllers/\*.ts)

- Extract req data → call service → format response
- Handle errors: try-catch → next(error)
- NO database queries, NO complex logic

### Layer 3: Services (services/\*.ts)

- ALL business logic + database queries
- Validate business rules
- Use transactions for multi-step ops
- Throw AppError on failures

## RESPONSE FORMAT (ALWAYS USE THIS)

```typescript
// Success
{ success: true, data: {...}, message?: string, meta?: {...} }

// Error (auto-formatted by middleware)
{ success: false, error: { message: string, code: string, details?: any } }
```

## REQUIRED FOR EVERY API

### 1. TypeScript Types (types/\*.types.ts)

```typescript
export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}
```

- NEVER use `any`
- Use interfaces for objects, types for unions

### 2. Zod Validation (validators/\*.validator.ts)

```typescript
export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  }),
});
```

- Validate ALL inputs (body, query, params)
- Clear error messages

### 3. Authentication

```typescript
// middleware/auth.middleware.ts
export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new AppError('No token', 401, 'UNAUTHORIZED');

  const decoded = jwt.verify(token, process.env.JWT_SECRET!);
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

  if (!user || user.deletedAt) throw new AppError('Invalid user', 401);

  req.user = {
    id: user.id,
    email: user.email,
    subscriptionTier: user.subscriptionTier,
  };
  next();
};
```

### 4. Authorization

```typescript
// middleware/authorize.middleware.ts
export const requireSubscription =
  (...tiers) =>
  (req, res, next) => {
    if (!tiers.includes(req.user.subscriptionTier)) {
      throw new AppError('Upgrade required', 403, 'SUBSCRIPTION_REQUIRED');
    }
    next();
  };
```

- Check subscription tier for premium features
- Verify resource ownership: `where: { id, userId }`

### 5. Rate Limiting

```typescript
// middleware/rate-limiter.middleware.ts
export const rateLimiter = ({ max, windowMs }) =>
  rateLimit({
    store: new RedisStore({ client: redis }),
    windowMs,
    max,
    keyGenerator: (req) => req.user?.id || req.ip,
    handler: () => { throw new AppError('Rate limit exceeded', 429); },
  });

// Presets
export const rateLimiters = {a
```

### 6. Logging

```typescript
// utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Usage
logger.info('Task created', { userId, taskId });
logger.warn('Suspicious activity', { userId, action });
logger.error('Database error', { error: error.message });
```

- Log ALL important events
- Include context: userId, requestId, resourceIds
- NEVER log passwords, tokens

### 7. Error Handling

```typescript
// utils/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// middleware/error.middleware.ts
export const errorHandler = (error, req, res, next) => {
  logger.error('Error', { error: error.message, stack: error.stack });

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        details: error.details,
      },
    });
  }

  // Prisma errors
  if (error.code === 'P2002') {
    return res
      .status(409)
      .json({
        success: false,
        error: { message: 'Duplicate', code: 'DUPLICATE' },
      });
  }

  // Default
  res.status(500).json({
    success: false,
    error: { message: 'Internal error', code: 'INTERNAL_ERROR' },
  });
};
```

### 8. Environment Variable Validation

```typescript
// config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().transform(Number).default('3001'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  REDIS_URL: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export const env = envSchema.parse(process.env);
```

- Validate ALL environment variables on startup
- Use Zod for validation
- Fail fast if required vars are missing

## EDGE CASES (HANDLE ALL)

For EVERY endpoint check:

✅ User authenticated?
✅ User owns resource? (`where: { id, userId }`)
✅ Resource exists and not soft-deleted?
✅ Inputs valid (type, range, format)?
✅ Business rules satisfied?
✅ External API failures handled?
✅ Subscription limits checked?
✅ Concurrent conflicts prevented?

## PROJECT STRUCTURE

```
src/
├── routes/          # Layer 1: Endpoints + middleware
├── controllers/     # Layer 2: HTTP handling
├── services/        # Layer 3: Business logic
├── middleware/      # Auth, rate limit, validation, errors
├── validators/      # Zod schemas
├── types/           # TypeScript types
├── utils/           # Errors, logger, helpers
├── lib/             # Prisma, Redis configs
└── config/          # Environment config
```

## COMPLETE API EXAMPLE

### Service

```typescript
// services/task.service.ts
export class TaskService {
  async createTask(userId: string, data: CreateTaskInput) {
    // Business rule validation
    if (data.dueDate && data.dueDate < new Date()) {
      throw new AppError('Due date must be future', 400, 'INVALID_DUE_DATE');
    }

    // Validate tagIds if provided (simple string array, no relation)
    if (data.tagIds && data.tagIds.length > 10) {
      throw new AppError('Maximum 10 tags allowed', 400, 'TOO_MANY_TAGS');
    }

    // Create with transaction
    const task = await prisma.task.create({
      data: { userId, ...data, status: 'TODO' },
    });

    logger.info('Task created', { userId, taskId: task.id });
    return task;
  }

  async listTasks(userId: string, filters: TaskListFilters) {
    const { status, page = 1, limit = 20 } = filters;

    const where = {
      userId,
      deletedAt: null,
      ...(status && { status }),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return { tasks, total, page, limit };
  }
}
```

### Controller

```typescript
// controllers/task.controller.ts
export class TaskController {
  private taskService = new TaskService();

  createTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const task = await this.taskService.createTask(req.user!.id, req.body);
      res.status(201).json({ success: true, data: { task } });
    } catch (error) {
      next(error);
    }
  };

  listTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.taskService.listTasks(req.user!.id, req.query);
      res.json({
        success: true,
        data: result.tasks,
        meta: { total: result.total, page: result.page, limit: result.limit },
      });
    } catch (error) {
      next(error);
    }
  };
}
```

### Route

```typescript
// routes/tasks.routes.ts
const router = Router();
const controller = new TaskController();

router.post(
  '/',
  authenticate,
  rateLimiters.standard,
  validateRequest(createTaskSchema),
  controller.createTask
);

router.get('/', authenticate, rateLimiters.standard, controller.listTasks);

export default router;
```

## MONGODB-SPECIFIC PATTERNS

### ObjectId Handling

```typescript
// Always use @db.ObjectId in schema for MongoDB
// Prisma handles conversion automatically

// When receiving IDs from client, validate format
import { z } from 'zod';
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);

// In validators
export const getTaskSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});
```

### Array Fields

```typescript
// MongoDB supports arrays natively
// tagIds is String[] - no relation needed
const task = await prisma.task.create({
  data: {
    userId,
    title: 'Task',
    tagIds: ['tag1', 'tag2'], // Simple string array
  },
});
```

### Soft Deletes

```typescript
// Always check deletedAt: null
const task = await prisma.task.findFirst({
  where: {
    id: taskId,
    userId,
    deletedAt: null, // Exclude soft-deleted
  },
});
```

### Prisma 7 Configuration

```typescript
// prisma.config.ts handles connection
// DATABASE_URL is configured there, not in schema.prisma
// PrismaClient reads from DATABASE_URL automatically
```

## SECURITY RULES

- Hash passwords: bcrypt cost 12+
- JWT expiry: 15min access, 7d refresh
- Validate ALL inputs with Zod
- Rate limit ALL endpoints
- Use HTTPS in production
- Set security headers (helmet)
- Never expose internal errors
- Check resource ownership: `where: { id, userId }`
- Implement CORS properly
- Sanitize user inputs
- Use parameterized queries (Prisma handles this)

## PERFORMANCE RULES

- Define indexes in Prisma schema
- Paginate lists (max 100 items)
- Use Redis caching for frequent queries
- Batch operations with `Promise.all()`
- Use transactions for consistency
- Log slow queries (>100ms)
- Lazy load relations: use `include` selectively
- Use `select` to fetch only needed fields
- Monitor query performance
- Use connection pooling

## DATABASE PATTERNS

```typescript
// Always filter by userId (security)
const tasks = await prisma.task.findMany({
  where: {
    userId,           // MANDATORY for user resources
    deletedAt: null,  // Exclude soft-deleted
    status: 'TODO',
  },
  select: {          // Only fetch needed fields
    id: true,
    title: true,
    dueDate: true,
  },
  orderBy: { createdAt: 'desc' },
  skip: (page - 1) * limit,
  take: limit,
});

// Use transactions for multi-step operations
await prisma.$transaction(async (tx) => {
  const session = await tx.focusSession.create({ data: {...} });
  await tx.user.update({
    where: { id: userId },
    data: { totalSessions: { increment: 1 } }
  });
  return session;
});
```

## TESTING REQUIREMENTS

### Unit Tests

```typescript
// services/__tests__/task.service.test.ts
describe('TaskService', () => {
  it('should create task with valid input', async () => {
    // Mock Prisma, test business logic
  });
});
```

### Integration Tests

```typescript
// __tests__/api/tasks.test.ts
describe('POST /api/tasks', () => {
  it('should create task when authenticated', async () => {
    // Test full request/response cycle
  });
});
```

### Test Coverage

- Minimum 80% coverage for services
- Test all edge cases
- Test error scenarios
- Mock external dependencies

## CHECKLIST (Before completing ANY API)

- [ ] Routes → Controllers → Services separation
- [ ] Types in separate file
- [ ] Zod validation applied
- [ ] Authentication middleware
- [ ] Authorization checks (ownership, subscription)
- [ ] Rate limiting configured
- [ ] All edge cases handled
- [ ] Logging for key events
- [ ] Consistent response format
- [ ] Error handling via `next()`
- [ ] No sensitive data in logs
- [ ] Soft delete check
- [ ] Pagination for lists
- [ ] Transactions if multi-step
- [ ] Environment variables validated
- [ ] MongoDB ObjectId validation
- [ ] Tests written (unit + integration)

## WORKFLOW

1. Define types (`types/*.types.ts`)
2. Create Zod schema (`validators/*.validator.ts`)
3. Write service with edge cases (`services/*.service.ts`)
4. Write controller (`controllers/*.controller.ts`)
5. Create route with middleware (`routes/*.routes.ts`)
6. Write tests
7. Test manually
8. Review checklist

## REMEMBER

You're building a PRODUCTION SaaS app. Every API must be:

- **Secure**: auth, validation, rate limiting
- **Robust**: edge cases, error handling
- **Fast**: indexes, caching, pagination
- **Maintainable**: clean code, logging

Write production-grade code like a senior backend architect.

**NO shortcuts. NO TODOs. NO unhandled edge cases.**
