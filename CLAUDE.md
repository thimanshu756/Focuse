---
alwaysApply: false
---

# Next.js 15 + TypeScript + Tailwind CSS + Framer Motion

## PROJECT CONTEXT

Building a premium AI-powered focus timer web app with beautiful UI/UX, smooth animations, and responsive design. The app must feel calm, professional, and delightful to use.

**Tech Stack:**

- Framework: Next.js 15 (App Router)
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS + Custom SCSS modules
- Animations: Framer Motion
- State: React Context + localStorage
- HTTP: Axios with interceptors
- Charts: Recharts or Chart.js
- Icons: Lucide React
- Forms: React Hook Form + Zod validation
- Toasts: React hot toast (re design the toast based on the theme)

---

## MANDATORY PRINCIPLES

### 1. MODULAR COMPONENTS (DRY)

- ✅ Every UI element is a reusable component
- ✅ Maximum 200 lines per component file
- ✅ One component = one responsibility
- ✅ Props are typed with TypeScript interfaces
- ❌ NEVER duplicate UI code
- ❌ NEVER write inline styles (use Tailwind/SCSS)

**Example Structure:**

```typescript
// components/dashboard/StatCard.tsx
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: number; // Optional +5% indicator
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

export function StatCard({ icon, label, value, trend, color = 'blue' }: StatCardProps) {
  return (
    <motion.div className="stat-card" whileHover={{ scale: 1.02 }}>
      {/* Implementation */}
    </motion.div>
  );
}
```

### 2. DESIGN SYSTEM (Strict Adherence)

**Colors (use Tailwind config):**

```javascript
// tailwind.config.js
colors: {
  primary: {
    accent: '#D7F50A',      // Main CTA yellow
    soft: '#E9FF6A',        // Hover state
  },
  background: {
    gradient: 'linear-gradient(180deg, #EAF2FF 0%, #E6FFE8 100%)',
    card: '#F6F9FF',
    cardBlue: '#E9F0FF',
    cardDark: '#111111',
  },
  text: {
    primary: '#0F172A',
    secondary: '#64748B',
    muted: '#94A3B8',
  },
  success: '#22C55E',
  error: '#EF4444',
}
```

**Typography:**

- Font: Inter (primary), SF Pro (fallback)
- Display: 32px, font-semibold
- Heading: 22px, font-semibold
- Body: 16px, font-normal
- Caption: 13px, font-normal
- Timer: 28px, font-semibold, tracking-tight

**Spacing (8px grid):**

- Screen padding: 20px
- Card padding: 16px
- Section gap: 24px
- Component gap: 12px

**Border Radius:**

- Small: 12px
- Medium: 16px
- Large: 24px
- Pill: 9999px (buttons)

**Shadows:**

- Card: `shadow-[0_8px_24px_rgba(15,23,42,0.08)]`
- Floating: `shadow-[0_12px_32px_rgba(15,23,42,0.12)]`

**Animations (Framer Motion):**

- Hover: scale(1.02), duration 200ms
- Page transitions: fadeIn + slideUp
- Success: confetti + bounce
- Loading: skeleton shimmer

### 3. RESPONSIVE DESIGN (Mobile-First)

**Breakpoints:**

- Mobile: 320px - 767px (base styles)
- Tablet: 768px - 1023px (md:)
- Desktop: 1024px+ (lg:)

**Rules:**

- ✅ Design mobile-first, enhance for larger screens
- ✅ Test on 320px, 375px, 768px, 1440px
- ✅ Touch targets minimum 44x44px
- ✅ Use responsive typography (clamp())
- ✅ Collapsible navigation on mobile
- ✅ Stack cards vertically on mobile, grid on desktop
- ❌ NEVER horizontal scroll (except intentional carousels)
- ❌ NEVER fixed pixel widths (use max-w, %, rem)

**Grid Patterns:**

```typescript
// Desktop: 4 columns, Tablet: 2 columns, Mobile: 1 column
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard {...} />
</div>
```

---

## COMPONENT ARCHITECTURE

### File Structure

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   └── layout.tsx           # Auth layout (centered, no nav)
├── (dashboard)/
│   ├── page.tsx             # Dashboard home
│   ├── tasks/
│   │   └── page.tsx
│   ├── forest/
│   │   └── page.tsx
│   ├── insights/
│   │   └── page.tsx
│   └── layout.tsx           # Main app layout (sidebar/header)
├── session/
│   └── page.tsx             # Full-screen focus mode
└── layout.tsx               # Root layout

components/
├── ui/                      # Reusable base components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Badge.tsx
│   ├── Skeleton.tsx
│   └── ...
├── dashboard/               # Dashboard-specific
│   ├── StatCard.tsx
│   ├── QuickStart.tsx
│   ├── TodayTasks.tsx
│   └── WeeklyChart.tsx
├── tasks/                   # Task management
│   ├── TaskCard.tsx
│   ├── TaskModal.tsx
│   ├── AIBreakdown.tsx
│   └── TaskFilters.tsx
├── session/                 # Focus session
│   ├── TreeAnimation.tsx
│   ├── TimerDisplay.tsx
│   ├── SessionControls.tsx
│   └── CompletionModal.tsx
├── forest/                  # Forest view
│   ├── TreeGrid.tsx
│   ├── TreeCard.tsx
│   └── TreeModal.tsx
└── shared/                  # Cross-feature
    ├── Header.tsx
    ├── Sidebar.tsx
    ├── LoadingSpinner.tsx
    └── EmptyState.tsx

lib/
├── api.ts                   # Axios instance + interceptors
├── auth.ts                  # Auth helpers (token, logout)
├── utils.ts                 # Date formatting, etc.
└── constants.ts             # API URLs, config

types/
├── api.types.ts             # API response types
├── task.types.ts
├── session.types.ts
└── user.types.ts

styles/
├── globals.css              # Tailwind imports
└── components/              # SCSS modules for complex components
    ├── TreeAnimation.module.scss
    └── ...
```

---

## UI/UX GUIDELINES

### Component Hierarchy (Think Like a Designer)

**Card Design:**

```typescript
// Good: Clean, spacious, clear hierarchy
<Card className="p-6 space-y-4">
  <div className="flex items-center justify-between">
    <h3 className="text-lg font-semibold">Title</h3>
    <Badge>NEW</Badge>
  </div>
  <p className="text-sm text-secondary">Description</p>
  <Button>Action</Button>
</Card>

// Bad: Cramped, no spacing, poor hierarchy
<Card className="p-2">
  <div><h3>Title</h3><Badge>NEW</Badge></div>
  <p>Description</p><Button>Action</Button>
</Card>
```

**Button States:**

```typescript
// Primary CTA - Always yellow (#D7F50A)
<Button variant="primary" size="lg">
  Start Focus Session
</Button>

// Secondary - White background
<Button variant="secondary">
  Cancel
</Button>

// Ghost - Transparent, hover effect
<Button variant="ghost">
  Learn More
</Button>

// Disabled - Reduced opacity
<Button disabled>
  Please wait...
</Button>
```

**Loading States (ALWAYS show feedback):**

```typescript
// Skeleton loading (preferred for data)
{isLoading ? <Skeleton count={3} /> : <TaskList tasks={tasks} />}

// Spinner (for actions)
<Button disabled={isLoading}>
  {isLoading ? <Spinner /> : 'Submit'}
</Button>
```

**Empty States (Friendly, actionable):**

```typescript
<EmptyState
  icon={<FolderOpen size={48} />}
  title="No tasks yet"
  description="Add your first task to start focusing"
  action={<Button onClick={openTaskModal}>Create Task</Button>}
/>
```

---

## ACCESSIBILITY (A11y)

**Rules:**

- ✅ All interactive elements have aria-label
- ✅ Keyboard navigation works (Tab, Enter, Esc)
- ✅ Focus visible (yellow outline, 2px)
- ✅ Color contrast ratio ≥ 4.5:1
- ✅ Form errors announced to screen readers
- ✅ Images have alt text
- ❌ NEVER rely on color alone for meaning

**Example:**

```typescript
<button
  aria-label="Start 25-minute focus session"
  className="focus:outline-none focus:ring-2 focus:ring-primary-accent"
>
  Start Session
</button>
```

---

## STATE MANAGEMENT

### React Context (for global state)

```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Usage
const { user, logout } = useAuth();
```

### Local State (useState for component-specific)

```typescript
// Good: Local state for UI interactions
const [isModalOpen, setIsModalOpen] = useState(false);
const [searchQuery, setSearchQuery] = useState('');

// Bad: Don't put API data in local state if shared across components
// Use context or React Query instead
```

---

## API INTEGRATION

### Axios Setup

```typescript
// lib/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
});

// Request interceptor (add auth token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (handle errors, refresh token)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh', {
            refreshToken,
          });
          localStorage.setItem('accessToken', data.data.accessToken);
          // Retry original request
          return api.request(error.config);
        } catch {
          // Refresh failed, logout
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
```

### API Hooks (Custom hooks for data fetching)

```typescript
// hooks/useTasks.ts
export function useTasks(filters?: TaskFilters) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      try {
        setIsLoading(true);
        const { data } = await api.get('/tasks', { params: filters });
        setTasks(data.data);
      } catch (err) {
        setError('Failed to load tasks');
      } finally {
        setIsLoading(false);
      }
    }
    fetchTasks();
  }, [filters]);

  return { tasks, isLoading, error, refetch: fetchTasks };
}

// Usage in component
const { tasks, isLoading } = useTasks({ status: 'TODO' });
```

---

## FORM HANDLING

### React Hook Form + Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be 8+ characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await api.post('/auth/login', data);
      router.push('/dashboard');
    } catch (error) {
      // Show error toast
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register('email')}
        type="email"
        label="Email"
        error={errors.email?.message}
      />
      <Input
        {...register('password')}
        type="password"
        label="Password"
        error={errors.password?.message}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}
```

---

## ANIMATIONS (Framer Motion)

### Page Transitions

```typescript
// app/layout.tsx
import { motion, AnimatePresence } from 'framer-motion';

export default function RootLayout({ children }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

### Component Animations

```typescript
// Hover scale
<motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
  <Card>...</Card>
</motion.div>

// Stagger children
<motion.div
  initial="hidden"
  animate="show"
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }}
>
  {items.map(item => (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

---

## PERFORMANCE OPTIMIZATION

**Rules:**

- ✅ Use Next.js Image component (automatic optimization)
- ✅ Lazy load components (React.lazy + Suspense)
- ✅ Memoize expensive calculations (useMemo)
- ✅ Debounce search inputs (500ms)
- ✅ Virtualize long lists (react-window for 100+ items)
- ❌ NEVER import entire icon libraries (use tree-shaking)
- ❌ NEVER fetch data in loops

**Example:**

```typescript
// Good: Lazy load modal (only loads when opened)
const TaskModal = lazy(() => import('./TaskModal'));

// Good: Debounced search
const debouncedSearch = useMemo(
  () => debounce((query: string) => fetchTasks(query), 500),
  []
);
```

---

## OPEN-SOURCE LIBRARIES (Use, Don't Reinvent)

**Approved Libraries:**

- Icons: lucide-react (modern, tree-shakeable)
- Charts: recharts (responsive, declarative)
- Forms: react-hook-form (performant, minimal re-renders)
- Validation: zod (TypeScript-first)
- Dates: date-fns (lightweight, tree-shakeable)
- Animations: framer-motion (smooth, declarative)
- HTTP: axios (interceptors, better than fetch)
- Notifications: react-hot-toast (minimal, beautiful)

**Installation:**

```bash
npm install lucide-react recharts react-hook-form zod date-fns framer-motion axios react-hot-toast
```

---

## ERROR HANDLING

### Global Error Boundary

```typescript
// components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <EmptyState
          title="Something went wrong"
          description="Please refresh the page"
          action={<Button onClick={() => window.location.reload()}>Refresh</Button>}
        />
      );
    }
    return this.props.children;
  }
}
```

### API Error Handling

```typescript
// Always show user-friendly errors
try {
  await api.post('/tasks', data);
  toast.success('Task created!');
} catch (error) {
  const message =
    error.response?.data?.error?.message || 'Something went wrong';
  toast.error(message);
}
```

---

## QUALITY CHECKLIST (Before Completion)

For EVERY component/screen:

- ✅ Fully responsive (test 320px, 768px, 1440px)
- ✅ All interactive elements have hover/focus states
- ✅ Loading states shown for async operations
- ✅ Error states handled gracefully
- ✅ Empty states are friendly and actionable
- ✅ Animations are smooth (60fps)
- ✅ Accessible (keyboard nav, ARIA labels)
- ✅ TypeScript types for all props
- ✅ No console errors/warnings
- ✅ Follows design system colors/spacing
- ✅ Code is DRY (no duplication)
- ✅ Components are modular (<200 lines)

---

## EXAMPLE: PERFECT COMPONENT

```typescript
// components/dashboard/StatCard.tsx
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: number;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  isLoading?: boolean;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color = 'blue',
  isLoading = false,
}: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  };

  if (isLoading) {
    return <Skeleton className="h-32 rounded-3xl" />;
  }

  return (
    <motion.div
      className="bg-card p-6 rounded-3xl shadow-card"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-2xl ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
        {trend !== undefined && (
          <span className={`text-sm font-medium ${trend >= 0 ? 'text-success' : 'text-error'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-3xl font-semibold text-primary mb-1">{value}</p>
      <p className="text-sm text-secondary">{label}</p>
    </motion.div>
  );
}
```

---

## REMEMBER

You're building a premium SaaS product. Every pixel matters. Every animation should feel smooth. Every interaction should be delightful. Users should feel they're using a $50/month product, not a free tool.

**Write production-grade code:**

- Modular components
- Beautiful design
- Responsive everywhere
- Smooth animations
- Accessible
- Performant

**NO shortcuts. NO hardcoded values. NO inline styles.**

Build like you're launching on Product Hunt tomorrow.
