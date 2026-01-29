# @forest/utils

Shared utility functions for the Forest focus timer app.

## Installation

```bash
pnpm add @forest/utils
```

## Usage

```typescript
import {
  formatDate,
  formatDuration,
  truncate,
  isValidEmail,
} from '@forest/utils';

// Date utilities
const formatted = formatDate(new Date(), 'MMM dd, yyyy'); // "Jan 26, 2026"
const duration = formatDuration(1525); // "25:25"

// String utilities
const short = truncate('Long text here', 10); // "Long te..."
const slug = slugify('Hello World!'); // "hello-world"

// Validation utilities
const valid = isValidEmail('user@example.com'); // true
const strong = isStrongPassword('MyPass123'); // true
```

## Modules

- **date.utils.ts** - Date formatting and manipulation
- **string.utils.ts** - String utilities (truncate, slugify, etc.)
- **validation.utils.ts** - Validation helpers

## Features

- Tree-shakeable exports
- Fully typed with TypeScript
- Zero dependencies (except date-fns)
- Works in browser and Node.js
