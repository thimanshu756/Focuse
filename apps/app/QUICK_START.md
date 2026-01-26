# Quick Start Guide

Get up and running with the Forest Focus React Native app in minutes.

## 1. Install Dependencies

From the workspace root:

```bash
pnpm install
```

## 2. Create Environment File

```bash
cd apps/app
cp .env.example .env
```

## 3. Start the Development Server

### Option A: Using Expo Go (Quickest)

```bash
# From workspace root
pnpm dev:app

# Or from app directory
cd apps/app
pnpm start
```

Then:

- Install "Expo Go" app on your phone
- Scan the QR code from the terminal
- App will load on your device

### Option B: Using iOS Simulator

```bash
# Ensure you have Xcode installed
pnpm app:ios
```

### Option C: Using Android Emulator

```bash
# Ensure you have Android Studio and an emulator set up
pnpm app:android
```

## 4. Start the Backend Server

In a separate terminal:

```bash
# From workspace root
pnpm dev:server
```

The app will connect to `http://localhost:8080/api` by default.

## Common Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev:app

# Run on iOS
pnpm app:ios

# Run on Android
pnpm app:android

# Run linter
pnpm --filter app lint

# Run tests
pnpm --filter app test

# Type check
pnpm --filter app type-check
```

## Project Structure Overview

```
apps/app/
├── app/              # Expo Router screens
│   ├── (tabs)/      # Main app tabs
│   ├── auth/        # Login/Signup
│   ├── session/     # Focus session
│   └── _layout.tsx  # Root layout
├── src/
│   ├── components/  # React components
│   ├── hooks/       # Custom hooks
│   ├── services/    # API services
│   ├── stores/      # Zustand stores
│   ├── utils/       # Utility functions
│   └── constants/   # Theme, config
└── assets/          # Images, fonts
```

## Navigation

The app uses Expo Router for navigation:

- `/` - Entry point (redirects based on auth)
- `/auth/login` - Login screen
- `/auth/signup` - Signup screen
- `/(tabs)` - Main app with bottom tabs
  - `/(tabs)/` - Dashboard
  - `/(tabs)/tasks` - Tasks
  - `/(tabs)/forest` - Forest
  - `/(tabs)/insights` - Insights
- `/session/[id]` - Focus session (full screen)

## Key Features

✅ File-based routing with Expo Router
✅ TypeScript with strict mode
✅ Zustand state management
✅ Axios API client with interceptors
✅ Token-based authentication
✅ Responsive design
✅ ESLint + Prettier configured
✅ Jest testing setup
✅ Monorepo integration

## Troubleshooting

### Metro bundler won't start

```bash
cd apps/app
pnpm clean:cache
pnpm start --clear
```

### Dependencies not found

```bash
# From workspace root
pnpm install

# Verify pnpm workspace
cat pnpm-workspace.yaml
```

### Type errors

```bash
cd apps/app
pnpm type-check
```

## Next Steps

1. ✅ App is running
2. 📱 Test on your device/simulator
3. 🎨 Add app assets (icon, splash)
4. 🔧 Configure environment variables
5. 🚀 Start building features!

## Documentation

- Full setup guide: [SETUP.md](./SETUP.md)
- Project structure: [STRUCTURE.md](./STRUCTURE.md)
- Main README: [README.md](./README.md)

## Need Help?

Check these resources:

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [React Native Docs](https://reactnative.dev/)

---

**Happy Coding! 🌲**
