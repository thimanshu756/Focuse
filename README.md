# Forest - Focus Timer Monorepo

A beautiful focus timer app with tree growing animations, built with Next.js, TypeScript, Tailwind CSS, and Framer Motion.

## 🏗️ Monorepo Structure

```
my-monorepo/
├── apps/
│   └── web/          # Next.js focus timer application
├── packages/
│   └── ui/          # Shared UI components and utilities
├── pnpm-workspace.yaml
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm

# Install all dependencies
pnpm install
```

### Development

```bash
# Start the development server
pnpm dev

# Or run from the web app directly
pnpm --filter web dev
```

### Build

```bash
# Build the web app
pnpm build

# Or run from the web app directly
pnpm --filter web build
```

## 📦 Packages

### `apps/web`

The main Next.js application featuring:

- Beautiful tree growing animations
- 3-tier tree system (Basic, Premium, Elite)
- Focus timer with customizable durations
- Modern, iOS-inspired UI design

### `packages/ui`

Shared UI components and utilities (to be expanded).

## 🎨 Features

- **Tree Animation System**: Watch your tree grow as you focus
- **Progressive Rewards**:
  - Basic Tree (0-15 mins): Simple green triangles
  - Premium Tree (15-45 mins): Vibrant greens with pink blossoms
  - Elite Tree (45+ mins): Blue gradient with golden cherry blossoms
- **Preview System**: See the full-grown tree before starting
- **Smooth Animations**: Framer Motion powered animations

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Package Manager**: pnpm

## 📝 Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run linter

## 🔒 Git Hooks (Husky)

This project uses Husky for git hooks:

### Pre-commit Hook

- Runs lint-staged to format staged files with Prettier
- Runs Next.js lint check if web app files are staged (after ESLint is configured)
- Automatically formats code before commit

### Commit-msg Hook

- Validates commit messages using commitlint
- Enforces Conventional Commits format

### Commit Message Format

All commits must follow this format:

```
<type>: <subject>
```

**Valid Examples:**

- `feat: Add tree animation component`
- `fix: Resolve timer reset issue`
- `feat: Implement premium tree design`
- `fix: Correct progress calculation`

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `revert`: Revert a previous commit

**Rules:**

- Type must be lowercase
- Subject must be lowercase (no sentence case)
- No period at the end
- Maximum 100 characters
- Must have a space after the colon

## 📄 License

MIT
