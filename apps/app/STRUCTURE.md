# App Structure Documentation

## Overview

This React Native Expo app follows a production-grade architecture with file-based routing, type safety, and modular component design.

## Directory Structure

```
apps/app/
├── app/                          # Expo Router - File-based routing
│   ├── (tabs)/                  # Tab navigation group
│   │   ├── _layout.tsx          # Tab layout configuration
│   │   ├── index.tsx            # Dashboard/Home screen
│   │   ├── tasks.tsx            # Tasks list screen
│   │   ├── forest.tsx           # Forest view screen
│   │   └── insights.tsx         # Analytics/Insights screen
│   ├── auth/                    # Auth screens (no tabs)
│   │   ├── login.tsx            # Login screen
│   │   └── signup.tsx           # Signup screen
│   ├── session/                 # Focus session screens
│   │   └── [id].tsx             # Dynamic focus session (full screen modal)
│   ├── _layout.tsx              # Root layout (splash, fonts, etc.)
│   └── index.tsx                # Entry point (auth check, redirect)
│
├── src/                         # Application source code
│   ├── components/              # React components
│   │   ├── ui/                  # Base UI components (Button, Card, Input, etc.)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ...
│   │   ├── shared/              # Shared components (Header, Modal, etc.)
│   │   └── features/            # Feature-specific components
│   │       ├── dashboard/       # Dashboard components
│   │       ├── tasks/           # Task management components
│   │       ├── forest/          # Forest view components
│   │       └── session/         # Focus session components
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts           # Auth hook (wrapper for zustand)
│   │   ├── useTasks.ts          # Tasks data hook
│   │   ├── useSessions.ts       # Sessions data hook
│   │   └── ...
│   │
│   ├── services/                # API and external services
│   │   ├── api.service.ts       # Axios instance with interceptors
│   │   ├── auth.service.ts      # Auth API calls
│   │   ├── tasks.service.ts     # Tasks API calls
│   │   ├── sessions.service.ts  # Sessions API calls
│   │   └── ...
│   │
│   ├── stores/                  # Zustand state management
│   │   ├── auth.store.ts        # Auth state (user, tokens, login, logout)
│   │   ├── tasks.store.ts       # Tasks state
│   │   ├── session.store.ts     # Active session state
│   │   └── ...
│   │
│   ├── utils/                   # Utility functions
│   │   ├── date.utils.ts        # Date formatting helpers
│   │   ├── validation.utils.ts  # Form validation
│   │   ├── storage.utils.ts     # Async storage helpers
│   │   └── ...
│   │
│   ├── types/                   # TypeScript types
│   │   ├── api.types.ts         # API response types
│   │   ├── task.types.ts        # Task-related types
│   │   ├── session.types.ts     # Session-related types
│   │   └── ...
│   │
│   ├── constants/               # App constants
│   │   ├── theme.ts             # Colors, spacing, typography
│   │   ├── config.ts            # App configuration
│   │   └── ...
│   │
│   └── theme/                   # Theme configuration (optional)
│       └── index.ts
│
├── assets/                      # Static assets
│   ├── images/                  # Images (PNG, JPG, etc.)
│   ├── fonts/                   # Custom fonts (TTF, OTF)
│   ├── sounds/                  # Audio files (MP3, WAV)
│   ├── icon.png                 # App icon (1024x1024)
│   ├── splash.png               # Splash screen
│   ├── adaptive-icon.png        # Android adaptive icon
│   └── favicon.png              # Web favicon
│
├── __tests__/                   # Test files
│   ├── components/
│   ├── hooks/
│   └── utils/
│
├── .expo/                       # Expo managed files (gitignored)
├── android/                     # Native Android code (generated)
├── ios/                         # Native iOS code (generated)
│
├── app.json                     # Expo configuration (static)
├── app.config.ts                # Expo configuration (dynamic)
├── babel.config.js              # Babel configuration
├── metro.config.js              # Metro bundler config (monorepo)
├── tsconfig.json                # TypeScript configuration
├── jest.config.js               # Jest test configuration
├── jest.setup.js                # Jest setup file
├── eas.json                     # EAS Build configuration
├── .eslintrc.js                 # ESLint configuration
├── .prettierrc                  # Prettier configuration
├── .gitignore                   # Git ignore file
├── .env.example                 # Environment variables example
├── package.json                 # Dependencies and scripts
├── README.md                    # Project documentation
├── SETUP.md                     # Setup instructions
└── STRUCTURE.md                 # This file
```

## Key Concepts

### 1. File-Based Routing (Expo Router)

Expo Router uses the file system as the router. Files in the `app/` directory automatically become routes:

- `app/index.tsx` → `/`
- `app/(tabs)/index.tsx` → `/(tabs)/`
- `app/auth/login.tsx` → `/auth/login`
- `app/session/[id].tsx` → `/session/:id` (dynamic route)

**Route Groups**: Folders wrapped in parentheses `(tabs)` are route groups and don't add path segments.

### 2. TypeScript Path Aliases

Configured in `tsconfig.json`:

```typescript
// Instead of: import { Button } from '../../../components/ui/Button'
import { Button } from '@/components/ui/Button';

// Other aliases
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/services/api.service';
import { COLORS } from '@/constants/theme';
```

### 3. State Management (Zustand)

Simple, lightweight state management without boilerplate:

```typescript
// Define store
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: async (email, password) => {
    // Login logic
    set({ user: userData });
  },
}));

// Use in component
const { user, login } = useAuthStore();
```

### 4. API Service

Centralized API client with interceptors for auth, error handling, and token refresh:

```typescript
import { api } from '@/services/api.service';

// Automatically adds auth token
const response = await api.get('/tasks');
```

### 5. Component Organization

**UI Components** (`src/components/ui/`)

- Generic, reusable components
- No business logic
- Highly configurable via props
- Examples: Button, Card, Input, Modal

**Shared Components** (`src/components/shared/`)

- App-specific but reusable across features
- May contain some business logic
- Examples: Header, EmptyState, LoadingSpinner

**Feature Components** (`src/components/features/`)

- Feature-specific components
- Contain business logic
- Examples: TaskCard, SessionTimer, ForestTree

### 6. Custom Hooks

Encapsulate reusable logic:

```typescript
// hooks/useTasks.ts
export function useTasks(filters?: TaskFilters) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  return { tasks, isLoading, refetch: fetchTasks };
}

// Usage in component
const { tasks, isLoading } = useTasks({ status: 'TODO' });
```

## Routing Patterns

### Navigation

```typescript
import { useRouter } from 'expo-router';

const router = useRouter();

// Navigate to route
router.push('/auth/login');

// Navigate and replace (no back)
router.replace('/(tabs)');

// Go back
router.back();

// Navigate with params
router.push(`/session/${sessionId}`);
```

### Dynamic Routes

```typescript
// app/session/[id].tsx
import { useLocalSearchParams } from 'expo-router';

export default function Session() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // Use id to fetch session data
}
```

## Styling Patterns

### Using Theme Constants

```typescript
import { StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.gradient,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
});
```

### Responsive Styles

```typescript
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const styles = StyleSheet.create({
  text: {
    fontSize: isSmallDevice ? 14 : 16,
  },
});
```

## Testing Patterns

```typescript
// __tests__/components/Button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button title="Click me" />);
    expect(getByText('Click me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Click me" onPress={onPress} />
    );
    fireEvent.press(getByText('Click me'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

## Best Practices

### 1. Component Structure

```typescript
// Imports
import { View, Text, StyleSheet } from 'react-native';
import { ComponentProps } from '@/types';

// Types
interface MyComponentProps extends ComponentProps {
  title: string;
  onPress: () => void;
}

// Component
export function MyComponent({ title, onPress }: MyComponentProps) {
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    // styles
  },
});
```

### 2. Error Handling

```typescript
try {
  await api.post('/tasks', data);
} catch (error) {
  if (error.response?.status === 400) {
    // Handle validation error
  } else {
    // Handle general error
  }
}
```

### 3. Loading States

Always show loading indicators:

```typescript
if (isLoading) {
  return <ActivityIndicator />;
}

return <YourContent />;
```

### 4. Type Safety

Use TypeScript for everything:

```typescript
// ✅ Good - Typed
interface Task {
  id: string;
  title: string;
}

// ❌ Bad - Untyped
const task: any = { ... };
```

## Monorepo Integration

### Access Shared Packages

```typescript
// Import from workspace packages
import { SharedButton } from 'ui';
```

### Metro Config

The `metro.config.js` is configured to:

- Watch the entire monorepo
- Resolve packages from workspace root
- Support TypeScript path aliases

## Environment Variables

All environment variables must be prefixed with `EXPO_PUBLIC_`:

```env
EXPO_PUBLIC_API_URL=http://localhost:8080/api
EXPO_PUBLIC_ENV=development
```

Access in code:

```typescript
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;
```

## Scripts Reference

| Script               | Description             |
| -------------------- | ----------------------- |
| `pnpm start`         | Start Expo dev server   |
| `pnpm dev`           | Start with dev client   |
| `pnpm ios`           | Run on iOS simulator    |
| `pnpm android`       | Run on Android emulator |
| `pnpm web`           | Run on web              |
| `pnpm lint`          | Run ESLint              |
| `pnpm test`          | Run tests               |
| `pnpm type-check`    | Check TypeScript        |
| `pnpm build:ios`     | Build iOS app           |
| `pnpm build:android` | Build Android app       |

## Additional Resources

- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [Zustand Docs](https://docs.pmnd.rs/zustand/)
- [React Native Docs](https://reactnative.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
