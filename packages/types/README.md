# @forest/types

Centralized TypeScript types for the Forest focus timer app.

## Installation

```bash
pnpm add @forest/types
```

## Usage

```typescript
import type {
  Task,
  TaskStatus,
  ApiResponse,
  CreateTaskRequest,
} from '@forest/types';

// Use entity types
const task: Task = {
  id: '123',
  userId: 'user-1',
  title: 'Complete project',
  status: TaskStatus.TODO,
  // ... other fields
};

// Use API request/response types
const createTask = async (
  data: CreateTaskRequest
): Promise<ApiResponse<Task>> => {
  // Implementation
};
```

## Packages

- **entities.types.ts** - Entity models (User, Task, Session, Device)
- **enums.types.ts** - Enum definitions matching Prisma schema
- **api.types.ts** - API request/response types

## Type Safety

All types match the Prisma schema exactly. Changes to the database schema should be reflected here immediately.
