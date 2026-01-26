# @forest/config

Shared configuration constants for the Forest focus timer app.

## Installation

```bash
pnpm add @forest/config
```

## Usage

```typescript
import { API_ROUTES, TIMER_DURATIONS, TASK_LIMITS } from '@forest/config';

// Use API routes
const loginUrl = API_ROUTES.AUTH.LOGIN;
const taskUrl = API_ROUTES.TASKS.GET('task-id-123');

// Use constants
const pomodoroTime = TIMER_DURATIONS.POMODORO; // 1500 seconds
const maxTitleLength = TASK_LIMITS.MAX_TITLE_LENGTH; // 200 chars
```

## Contents

- **api-routes.ts** - API endpoint paths
- **constants.ts** - App constants (timer durations, limits, etc.)

## Features

- Type-safe constants using `as const`
- Centralized configuration
- Easy to maintain and update
- Shared across web and mobile
