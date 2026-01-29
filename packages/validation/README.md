# @forest/validation

Centralized Zod validation schemas for the Forest focus timer app.

## Installation

```bash
pnpm add @forest/validation
```

## Usage

```typescript
import { loginSchema, createTaskSchema } from '@forest/validation';

// Validate login form
const result = loginSchema.safeParse({
  email: 'user@example.com',
  password: 'password123',
});

if (!result.success) {
  console.error(result.error.issues);
}

// Use with React Hook Form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const { register, handleSubmit } = useForm({
  resolver: zodResolver(loginSchema),
});
```

## Schemas Available

- **auth.schema.ts** - Login, signup, password reset validation
- **task.schema.ts** - Task creation and update validation
- **session.schema.ts** - Focus session validation
- **device.schema.ts** - Device registration validation
- **sync.schema.ts** - Offline sync operation validation

## Features

- Clear error messages
- Type-safe with TypeScript
- Matches backend validation exactly
- Compatible with React Hook Form
