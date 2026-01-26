# Forest Focus - React Native App

Production-grade React Native Expo app for the Forest Focus timer application.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- iOS Simulator (for iOS development)
- Android Studio + Android Emulator (for Android development)
- Expo Go app (for quick testing)

### Installation

```bash
# From workspace root
pnpm install

# From app directory
cd apps/app
pnpm install
```

### Development

```bash
# Start development server
pnpm dev

# Start on iOS
pnpm ios

# Start on Android
pnpm android

# Start on Web
pnpm web

# Run from workspace root
pnpm --filter app dev
```

## 📁 Project Structure

```
apps/app/
├── app/                    # Expo Router app directory
│   ├── (auth)/            # Auth screens (login, signup)
│   ├── (tabs)/            # Main app tabs
│   ├── session/           # Focus session screen
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry screen
├── src/
│   ├── components/        # Reusable components
│   │   ├── ui/           # Base UI components
│   │   ├── shared/       # Shared components
│   │   └── features/     # Feature-specific components
│   ├── screens/          # Screen components (if not using expo-router)
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services
│   ├── stores/           # Zustand stores
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript types
│   ├── constants/        # App constants
│   └── theme/            # Theme configuration
├── assets/               # Images, fonts, etc.
├── app.json             # Expo configuration
├── tsconfig.json        # TypeScript configuration
├── metro.config.js      # Metro bundler config (monorepo setup)
└── package.json         # Dependencies and scripts
```

## 🛠️ Technology Stack

- **Framework**: Expo ~52.0 (React Native 0.76.6)
- **Language**: TypeScript 5.7
- **Navigation**: Expo Router 4.0
- **State Management**: Zustand 5.0
- **HTTP Client**: Axios
- **Animations**: React Native Reanimated
- **Icons**: Lucide React Native
- **Testing**: Jest + React Native Testing Library

## 📱 Features

- ✅ File-based routing with Expo Router
- ✅ TypeScript with strict mode
- ✅ ESLint + Prettier configuration
- ✅ Jest testing setup
- ✅ Monorepo integration (pnpm workspaces)
- ✅ Path aliases (@/, @/components, etc.)
- ✅ Environment variables support
- ✅ EAS Build configuration
- ✅ Development, Preview, and Production builds
- ✅ Gesture handling (react-native-gesture-handler)
- ✅ Smooth animations (react-native-reanimated)

## 🧪 Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

## 🎨 Code Quality

```bash
# Lint
pnpm lint

# Fix lint errors
pnpm lint:fix

# Format code
pnpm format

# Check formatting
pnpm format:check

# Type check
pnpm type-check
```

## 📦 Building

### Development Build

```bash
# iOS
pnpm build:ios --profile development

# Android
pnpm build:android --profile development
```

### Production Build

```bash
# All platforms
pnpm build:all --profile production

# iOS only
pnpm build:ios --profile production

# Android only
pnpm build:android --profile production
```

## 🚢 Deployment

### Configure EAS

1. Install EAS CLI globally:

```bash
npm install -g eas-cli
```

2. Login to Expo:

```bash
eas login
```

3. Configure project:

```bash
eas build:configure
```

### Submit to App Stores

```bash
# iOS App Store
pnpm submit:ios

# Google Play Store
pnpm submit:android
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

All environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the app.

### Monorepo Integration

The app is configured to work with the monorepo structure:

- Metro bundler is configured to resolve packages from workspace root
- TypeScript paths are set up for shared packages
- Can import from `ui` package: `import { Button } from 'ui'`

## 📚 Documentation

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native](https://reactnative.dev/)
- [EAS Build](https://docs.expo.dev/build/introduction/)

## 🐛 Common Issues

### Metro bundler cache issues

```bash
pnpm clean:cache
pnpm start --clear
```

### iOS Simulator not working

```bash
# Reset iOS simulator
xcrun simctl erase all

# Rebuild
pnpm ios
```

### Android build fails

```bash
# Clean Android build
cd android
./gradlew clean
cd ..
pnpm android
```

## 📝 Scripts Reference

| Script               | Description                           |
| -------------------- | ------------------------------------- |
| `pnpm dev`           | Start Expo dev server with dev client |
| `pnpm start`         | Start Expo dev server                 |
| `pnpm ios`           | Run on iOS simulator                  |
| `pnpm android`       | Run on Android emulator               |
| `pnpm web`           | Run on web browser                    |
| `pnpm lint`          | Run ESLint                            |
| `pnpm test`          | Run Jest tests                        |
| `pnpm type-check`    | Check TypeScript types                |
| `pnpm build:android` | Build Android app with EAS            |
| `pnpm build:ios`     | Build iOS app with EAS                |

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📄 License

Private - All rights reserved
