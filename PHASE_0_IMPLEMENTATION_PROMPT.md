# 🎯 PHASE 0: Foundation & Shared Packages - Implementation Prompt

## 📋 OVERVIEW

**Goal:** Eliminate code duplication between web and mobile apps, establish type-safe contracts, and prepare backend for mobile offline sync capabilities.

**Timeline:** 3-5 days  
**Priority:** CRITICAL (blocks all mobile development)

---

## 🎯 OBJECTIVES

1. ✅ Create 5 shared packages (`@forest/types`, `@forest/validation`, `@forest/api-client`, `@forest/utils`, `@forest/config`)
2. ✅ Migrate web app to use shared packages (zero regression)
3. ✅ Configure TypeScript workspace with project references
4. ✅ Implement backend API endpoints for mobile sync (`/sync/tasks`, `/sync/sessions`, `/devices`, `/health`)

---

## 📦 TASK 1: CREATE SHARED PACKAGES

### 1.1 Package Structure Setup

Create the following directory structure:

```
packages/
├── types/
│   ├── package.json
│   ├── tsconfig.json
│   ├── index.ts
│   └── src/
│       ├── api.types.ts
│       ├── entities.types.ts
│       └── enums.types.ts
├── validation/
│   ├── package.json
│   ├── tsconfig.json
│   ├── index.ts
│   └── src/
│       ├── auth.schema.ts
│       ├── task.schema.ts
│       └── session.schema.ts
├── api-client/
│   ├── package.json
│   ├── tsconfig.json
│   ├── index.ts
│   └── src/
│       ├── client.ts
│       ├── endpoints/
│       │   ├── auth.ts
│       │   ├── tasks.ts
│       │   ├── sessions.ts
│       │   ├── sync.ts
│       │   └── devices.ts
│       └── hooks/
│           ├── useAuth.ts
│           ├── useTasks.ts
│           └── useSessions.ts
├── utils/
│   ├── package.json
│   ├── tsconfig.json
│   ├── index.ts
│   └── src/
│       ├── date.utils.ts
│       ├── string.utils.ts
│       └── validation.utils.ts
└── config/
    ├── package.json
    ├── tsconfig.json
    ├── index.ts
    └── src/
        ├── api-routes.ts
        └── constants.ts
```

### 1.2 Package: `@forest/types`

**Purpose:** Centralized TypeScript types for API responses, entities, and enums.

**Files to Create:**

#### `packages/types/package.json`

```json
{
  "name": "@forest/types",
  "version": "1.0.0",
  "main": "./index.ts",
  "types": "./index.ts",
  "scripts": {
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

#### `packages/types/src/entities.types.ts`

```typescript
// User, Task, Session, Device entities
// Extract from existing web app types
// Include all fields from Prisma schema
```

**Requirements:**

- Export `User`, `Task`, `Session`, `Device` types
- Include all Prisma fields (id, createdAt, updatedAt, etc.)
- Use consistent naming (camelCase for TypeScript)
- Add JSDoc comments for complex types

#### `packages/types/src/enums.types.ts`

```typescript
// TaskStatus, TaskPriority, SessionStatus, etc.
// Use TypeScript enums or const objects
```

**Requirements:**

- Export all enums used across web/mobile/server
- Match Prisma enum definitions exactly
- Include JSDoc for each enum value

#### `packages/types/src/api.types.ts`

```typescript
// API request/response types
// LoginRequest, LoginResponse, CreateTaskRequest, etc.
```

**Requirements:**

- Request types for all API endpoints
- Response types with `success: boolean` and `data: T` structure
- Error response types
- Pagination types (if applicable)

#### `packages/types/index.ts`

```typescript
// Re-export all types
export * from './src/entities.types';
export * from './src/enums.types';
export * from './src/api.types';
```

### 1.3 Package: `@forest/validation`

**Purpose:** Zod schemas for form validation and API request validation.

**Dependencies:**

- `zod: ^3.22.0`
- `@forest/types` (peer dependency)

**Files to Create:**

#### `packages/validation/src/auth.schema.ts`

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
```

**Requirements:**

- Match existing web app validation rules
- Include helpful error messages
- Export TypeScript types: `type LoginForm = z.infer<typeof loginSchema>`

#### `packages/validation/src/task.schema.ts`

```typescript
// createTaskSchema, updateTaskSchema, etc.
```

**Requirements:**

- Validate task title, description, priority, status
- Match backend validation rules
- Export inferred types

#### `packages/validation/src/session.schema.ts`

```typescript
// createSessionSchema, updateSessionSchema, etc.
```

**Requirements:**

- Validate duration, taskId, startTime
- Match backend validation rules

### 1.4 Package: `@forest/api-client`

**Purpose:** Axios instance with interceptors, typed API endpoints, and React hooks.

**Dependencies:**

- `axios: ^1.6.0`
- `@forest/types` (peer dependency)
- `@forest/config` (peer dependency)
- `react: ^18.0.0` (peer dependency, for hooks)

**Files to Create:**

#### `packages/api-client/src/client.ts`

```typescript
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@forest/config';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add auth token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Get token from localStorage (web) or AsyncStorage (mobile)
  // This will be platform-specific, so use a getter function
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle errors, refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or logout
      // This will be platform-specific
    }
    return Promise.reject(error);
  }
);

// Platform-specific token getter (to be implemented by consuming app)
export function setTokenGetter(getter: () => string | null) {
  // Store getter function
}
```

**Requirements:**

- Use environment variable for base URL (from `@forest/config`)
- Handle 401 errors (token refresh logic)
- Handle network errors gracefully
- Export typed axios instance

#### `packages/api-client/src/endpoints/auth.ts`

```typescript
import { apiClient } from '../client';
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
} from '@forest/types';

export const authEndpoints = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    const response = await apiClient.post('/auth/signup', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', { token, password });
  },
};
```

**Requirements:**

- Type all request/response parameters
- Use `apiClient` instance
- Export object with named functions
- Match existing web app API calls

#### `packages/api-client/src/endpoints/tasks.ts`

```typescript
// getAllTasks, getTaskById, createTask, updateTask, deleteTask
// Include query parameters (filters, pagination)
```

#### `packages/api-client/src/endpoints/sessions.ts`

```typescript
// getAllSessions, getSessionById, createSession, updateSession, deleteSession
// getForestData (for forest screen)
```

#### `packages/api-client/src/endpoints/sync.ts` ⚠️ NEW

```typescript
import { apiClient } from '../client';
import type {
  SyncTasksRequest,
  SyncTasksResponse,
  SyncSessionsRequest,
  SyncSessionsResponse,
} from '@forest/types';

export const syncEndpoints = {
  syncTasks: async (data: SyncTasksRequest): Promise<SyncTasksResponse> => {
    const response = await apiClient.post('/sync/tasks', data);
    return response.data;
  },

  syncSessions: async (
    data: SyncSessionsRequest
  ): Promise<SyncSessionsResponse> => {
    const response = await apiClient.post('/sync/sessions', data);
    return response.data;
  },
};
```

**Requirements:**

- Support batch operations (CREATE, UPDATE, DELETE)
- Handle conflict resolution (server timestamp wins)
- Map temp client IDs to real server IDs

#### `packages/api-client/src/endpoints/devices.ts` ⚠️ NEW

```typescript
import { apiClient } from '../client';
import type {
  RegisterDeviceRequest,
  RegisterDeviceResponse,
} from '@forest/types';

export const deviceEndpoints = {
  registerDevice: async (
    data: RegisterDeviceRequest
  ): Promise<RegisterDeviceResponse> => {
    const response = await apiClient.post('/devices', data);
    return response.data;
  },

  updatePushToken: async (
    deviceId: string,
    pushToken: string
  ): Promise<void> => {
    await apiClient.patch(`/devices/${deviceId}`, { pushToken });
  },
};
```

#### `packages/api-client/src/hooks/useAuth.ts`

```typescript
import { useState, useCallback } from 'react';
import { authEndpoints } from '../endpoints/auth';
import type { LoginRequest, User } from '@forest/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authEndpoints.login(data);
      setUser(response.data.user);
      // Store token (platform-specific)
      return response;
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authEndpoints.logout();
    setUser(null);
    // Clear token (platform-specific)
  }, []);

  return { user, login, logout, isLoading, error };
}
```

**Requirements:**

- React hooks for common API operations
- Handle loading/error states
- Platform-agnostic (token storage handled by consuming app)

### 1.5 Package: `@forest/utils`

**Purpose:** Shared utility functions (date formatting, string helpers, validation).

**Dependencies:**

- `date-fns: ^2.30.0` (for date utilities)

**Files to Create:**

#### `packages/utils/src/date.utils.ts`

```typescript
import { format, formatDistance, parseISO } from 'date-fns';

export function formatDate(
  date: Date | string,
  formatStr: string = 'MMM dd, yyyy'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
```

**Requirements:**

- Extract date utilities from web app
- Use `date-fns` for consistency
- Export all utility functions

#### `packages/utils/src/string.utils.ts`

```typescript
// truncate, capitalize, slugify, etc.
```

#### `packages/utils/src/validation.utils.ts`

```typescript
// email validation, phone validation, etc.
```

### 1.6 Package: `@forest/config`

**Purpose:** Shared constants (API routes, timer durations, limits).

**Files to Create:**

#### `packages/config/src/api-routes.ts`

```typescript
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  TASKS: {
    LIST: '/api/tasks',
    CREATE: '/api/tasks',
    UPDATE: (id: string) => `/api/tasks/${id}`,
    DELETE: (id: string) => `/api/tasks/${id}`,
  },
  SESSIONS: {
    LIST: '/api/sessions',
    CREATE: '/api/sessions',
    UPDATE: (id: string) => `/api/sessions/${id}`,
    DELETE: (id: string) => `/api/sessions/${id}`,
    FOREST: '/api/sessions/forest',
  },
  SYNC: {
    TASKS: '/api/sync/tasks',
    SESSIONS: '/api/sync/sessions',
  },
  DEVICES: {
    REGISTER: '/api/devices',
    UPDATE: (id: string) => `/api/devices/${id}`,
  },
  HEALTH: '/api/health',
} as const;
```

#### `packages/config/src/constants.ts`

```typescript
export const TIMER_DURATIONS = {
  POMODORO: 25 * 60, // 25 minutes in seconds
  SHORT_BREAK: 5 * 60,
  LONG_BREAK: 15 * 60,
} as const;

export const TASK_LIMITS = {
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 2000,
} as const;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
```

**Requirements:**

- Use environment variables where appropriate
- Export all constants
- Type-safe (use `as const`)

### 1.7 Package Configuration Files

Each package needs:

#### `tsconfig.json` (for each package)

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true,
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### `README.md` (for each package)

```markdown
# @forest/[package-name]

[Description]

## Installation

\`\`\`bash
pnpm add @forest/[package-name]
\`\`\`

## Usage

[Examples]
```

---

## 🔧 TASK 2: CONFIGURE TYPESCRIPT WORKSPACE

### 2.1 Create Root `tsconfig.base.json`

**File:** `tsconfig.base.json` (root)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@forest/types": ["./packages/types/src"],
      "@forest/validation": ["./packages/validation/src"],
      "@forest/api-client": ["./packages/api-client/src"],
      "@forest/utils": ["./packages/utils/src"],
      "@forest/config": ["./packages/config/src"]
    }
  },
  "exclude": ["node_modules", "dist", "build", ".next"]
}
```

### 2.2 Update Package `package.json` Files

Add to root `package.json`:

```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

Update `pnpm-workspace.yaml` (already correct, verify):

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 2.3 Update App `tsconfig.json` Files

Update `apps/web/tsconfig.json`, `apps/app/tsconfig.json`, `apps/server/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@forest/types": ["../../packages/types/src"],
      "@forest/validation": ["../../packages/validation/src"],
      "@forest/api-client": ["../../packages/api-client/src"],
      "@forest/utils": ["../../packages/utils/src"],
      "@forest/config": ["../../packages/config/src"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

---

## 🔄 TASK 3: MIGRATE WEB APP TO SHARED PACKAGES

### 3.1 Install Shared Packages

**File:** `apps/web/package.json`

Add dependencies:

```json
{
  "dependencies": {
    "@forest/types": "workspace:*",
    "@forest/validation": "workspace:*",
    "@forest/api-client": "workspace:*",
    "@forest/utils": "workspace:*",
    "@forest/config": "workspace:*"
  }
}
```

### 3.2 Replace Local Types

**Action:** Find all local type definitions in `apps/web` and replace with imports from `@forest/types`.

**Files to Update:**

- `apps/web/types/*.ts` → Remove, use `@forest/types`
- `apps/web/lib/types.ts` → Remove, use `@forest/types`

**Example Migration:**

```typescript
// Before
import type { Task } from '@/types/task';

// After
import type { Task } from '@forest/types';
```

### 3.3 Replace Local API Client

**Action:** Replace web app's axios instance with `@forest/api-client`.

**Files to Update:**

- `apps/web/lib/api.ts` → Remove or wrap `@forest/api-client`
- Update all API calls to use `@forest/api-client/endpoints/*`

**Example Migration:**

```typescript
// Before
import { api } from '@/lib/api';
const response = await api.post('/auth/login', data);

// After
import { authEndpoints } from '@forest/api-client';
const response = await authEndpoints.login(data);
```

### 3.4 Replace Local Validation

**Action:** Replace local Zod schemas with `@forest/validation`.

**Files to Update:**

- `apps/web/lib/validation.ts` → Remove, use `@forest/validation`

**Example Migration:**

```typescript
// Before
import { loginSchema } from '@/lib/validation';

// After
import { loginSchema } from '@forest/validation';
```

### 3.5 Replace Local Utils

**Action:** Replace local utility functions with `@forest/utils`.

**Files to Update:**

- `apps/web/lib/utils.ts` → Remove date/string utils, use `@forest/utils`

### 3.6 Verify Web App Still Works

**Testing Checklist:**

- ✅ `pnpm --filter web build` succeeds
- ✅ `pnpm --filter web dev` runs without errors
- ✅ Login flow works
- ✅ Task creation works
- ✅ Session creation works
- ✅ All API calls succeed
- ✅ No TypeScript errors
- ✅ No runtime errors in browser console

---

## 🚀 TASK 4: BACKEND API CHANGES FOR MOBILE

### 4.1 Database Schema Updates

**File:** `apps/server/prisma/schema.prisma`

Add new models and fields:

```prisma
model Device {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  deviceId  String   @unique
  platform  String   // "android" | "ios"
  osVersion String?
  appVersion String
  pushToken String?
  lastSeenAt DateTime @default(now())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@map("devices")
}

model User {
  // ... existing fields
  devices      Device[]
  lastSyncedAt DateTime?
}

model Task {
  // ... existing fields
  clientId  String?  @unique // Temp ID from client (for sync mapping)
  updatedAt DateTime @updatedAt
}

model Session {
  // ... existing fields
  clientId  String?  @unique
  updatedAt DateTime @updatedAt
}
```

**Migration:**

```bash
cd apps/server
pnpm prisma migrate dev --name add_mobile_sync_support
pnpm prisma generate
```

### 4.2 Create Sync Endpoints

**File:** `apps/server/src/routes/sync.routes.ts` (NEW)

```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { syncTasks, syncSessions } from '../controllers/sync.controller';

const router = Router();

router.post('/tasks', authenticate, syncTasks);
router.post('/sessions', authenticate, syncSessions);

export default router;
```

**File:** `apps/server/src/controllers/sync.controller.ts` (NEW)

```typescript
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function syncTasks(req: Request, res: Response) {
  try {
    const { clientId, lastSyncedAt, operations } = req.body;
    const userId = req.user.id;

    const synced: string[] = [];
    const conflicts: any[] = [];
    const mapping: Record<string, string> = {};

    // Process each operation
    for (const op of operations) {
      const { id, operation, data, timestamp } = op;

      if (operation === 'CREATE') {
        // Check if temp ID already exists (duplicate)
        const existing = await prisma.task.findUnique({
          where: { clientId: id },
        });

        if (existing) {
          conflicts.push({ id, reason: 'Duplicate temp ID' });
          continue;
        }

        // Create task
        const task = await prisma.task.create({
          data: {
            ...data,
            userId,
            clientId: id, // Store temp ID for mapping
          },
        });

        mapping[id] = task.id;
        synced.push(task.id);
      } else if (operation === 'UPDATE') {
        // Find task by real ID or clientId
        const task = await prisma.task.findFirst({
          where: {
            OR: [{ id }, { clientId: id }],
            userId,
          },
        });

        if (!task) {
          conflicts.push({ id, reason: 'Task not found' });
          continue;
        }

        // Conflict resolution: server timestamp wins
        if (task.updatedAt > new Date(timestamp)) {
          conflicts.push({ id, reason: 'Server version is newer' });
          continue;
        }

        // Update task
        await prisma.task.update({
          where: { id: task.id },
          data: {
            ...data,
            updatedAt: new Date(),
          },
        });

        synced.push(task.id);
      } else if (operation === 'DELETE') {
        // Similar logic for delete
        // ...
      }
    }

    // Fetch all tasks updated since lastSyncedAt
    const serverTasks = await prisma.task.findMany({
      where: {
        userId,
        updatedAt: {
          gt: lastSyncedAt ? new Date(lastSyncedAt) : new Date(0),
        },
      },
    });

    // Update user's lastSyncedAt
    await prisma.user.update({
      where: { id: userId },
      data: { lastSyncedAt: new Date() },
    });

    res.json({
      success: true,
      data: {
        synced: synced.length,
        conflicts: conflicts.length,
        mapping,
        serverTasks,
        lastSyncedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Sync failed', details: error.message },
    });
  }
}

export async function syncSessions(req: Request, res: Response) {
  // Similar implementation for sessions
  // ...
}
```

### 4.3 Create Device Endpoints

**File:** `apps/server/src/routes/device.routes.ts` (NEW)

```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  registerDevice,
  updatePushToken,
} from '../controllers/device.controller';

const router = Router();

router.post('/', authenticate, registerDevice);
router.patch('/:id', authenticate, updatePushToken);

export default router;
```

**File:** `apps/server/src/controllers/device.controller.ts` (NEW)

```typescript
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function registerDevice(req: Request, res: Response) {
  try {
    const { deviceId, platform, osVersion, appVersion, pushToken } = req.body;
    const userId = req.user.id;

    // Upsert device
    const device = await prisma.device.upsert({
      where: { deviceId },
      update: {
        platform,
        osVersion,
        appVersion,
        pushToken,
        lastSeenAt: new Date(),
        userId,
      },
      create: {
        deviceId,
        platform,
        osVersion,
        appVersion,
        pushToken,
        userId,
      },
    });

    res.json({
      success: true,
      data: {
        id: device.id,
        registered: true,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Device registration failed' },
    });
  }
}

export async function updatePushToken(req: Request, res: Response) {
  // Update push token for existing device
  // ...
}
```

### 4.4 Create Health Endpoint

**File:** `apps/server/src/routes/health.routes.ts` (NEW)

```typescript
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      minAppVersion: '1.0.0',
      latestAppVersion: '1.0.0',
      forceUpdate: false,
    },
  });
});

export default router;
```

### 4.5 Register Routes

**File:** `apps/server/src/index.ts` (or main router file)

```typescript
import syncRoutes from './routes/sync.routes';
import deviceRoutes from './routes/device.routes';
import healthRoutes from './routes/health.routes';

app.use('/api/sync', syncRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/health', healthRoutes);
```

### 4.6 Update API Documentation

**Action:** Document new endpoints in API docs (Swagger/Postman).

**Required Documentation:**

- Request/response schemas
- Authentication requirements
- Error responses
- Example requests

---

## ✅ ACCEPTANCE CRITERIA

### Package Creation

- [ ] All 5 packages exist with `package.json` + `tsconfig.json`
- [ ] Each package has `README.md` with usage examples
- [ ] All packages export from `index.ts`
- [ ] TypeScript compiles without errors (`pnpm --filter @forest/types type-check`)

### TypeScript Workspace

- [ ] `tsconfig.base.json` exists at root
- [ ] All packages extend base config
- [ ] Path aliases work (`@forest/types` resolves correctly)
- [ ] Project references enabled (faster builds)

### Web App Migration

- [ ] Web app imports from `@forest/*` packages
- [ ] `pnpm --filter web build` succeeds
- [ ] `pnpm --filter web dev` runs without errors
- [ ] All features work (login, tasks, sessions)
- [ ] No TypeScript errors
- [ ] No runtime errors

### Backend API

- [ ] Database migration applied (`Device` model exists)
- [ ] `/api/sync/tasks` endpoint works (test with Postman)
- [ ] `/api/sync/sessions` endpoint works
- [ ] `/api/devices` endpoint works (register device)
- [ ] `/api/health` endpoint works
- [ ] Conflict resolution logic works (server timestamp wins)
- [ ] API docs updated

---

## 🧪 TESTING CHECKLIST

### Package Tests

```bash
# Test each package
pnpm --filter @forest/types type-check
pnpm --filter @forest/validation type-check
pnpm --filter @forest/api-client type-check
pnpm --filter @forest/utils type-check
pnpm --filter @forest/config type-check
```

### Web App Tests

```bash
# Build web app
pnpm --filter web build

# Run dev server
pnpm --filter web dev

# Manual testing:
# 1. Login → Should work
# 2. Create task → Should work
# 3. Start session → Should work
# 4. Check browser console → No errors
```

### Backend Tests

```bash
# Test sync endpoint
curl -X POST http://localhost:8080/api/sync/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "test-device",
    "lastSyncedAt": "2026-01-01T00:00:00Z",
    "operations": []
  }'

# Test device registration
curl -X POST http://localhost:8080/api/devices \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-device-123",
    "platform": "android",
    "osVersion": "14",
    "appVersion": "1.0.0",
    "pushToken": "ExponentPushToken[xxx]"
  }'

# Test health endpoint
curl http://localhost:8080/api/health
```

---

## 📝 DEFINITION OF DONE

**Phase 0 is complete when:**

1. ✅ All 5 shared packages exist and are properly configured
2. ✅ Web app successfully uses shared packages (zero regression)
3. ✅ TypeScript workspace configured with path aliases
4. ✅ Backend has 3 new endpoints (`/sync/tasks`, `/sync/sessions`, `/devices`)
5. ✅ Backend has `/api/health` endpoint
6. ✅ Database schema updated (`Device` model, `lastSyncedAt` on User)
7. ✅ All packages have README with usage examples
8. ✅ API documentation updated
9. ✅ Postman collection updated
10. ✅ Web app in production still works (no downtime)

---

## 🚨 IMPORTANT NOTES

1. **Zero Regression:** Web app must work exactly as before after migration
2. **Type Safety:** All types must be exported from `@forest/types`
3. **Backward Compatibility:** Backend changes should not break existing web app
4. **Testing:** Test thoroughly before considering phase complete
5. **Documentation:** Every package needs a README

---

## 🎯 NEXT STEPS (After Phase 0)

Once Phase 0 is complete, proceed to:

- **Phase 1:** Core Mobile Infrastructure (observability, offline storage, push notifications)
- Mobile app can now import from `@forest/*` packages
- Backend is ready for mobile sync operations

---

**Ready to implement? Start with Task 1.1 and work through each task sequentially. Test after each major change!**
