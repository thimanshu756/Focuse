# React Native Expo App Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0
- **Expo CLI**: `npm install -g expo-cli` or `pnpm add -g expo-cli`
- **EAS CLI** (for builds): `npm install -g eas-cli`

### For iOS Development

- macOS with Xcode installed
- iOS Simulator
- Apple Developer Account (for device testing and App Store)

### For Android Development

- Android Studio
- Android SDK
- Android Emulator or physical device

## Installation

### 1. Install Dependencies

From the workspace root:

```bash
# Install all dependencies
pnpm install
```

Or from the app directory:

```bash
cd apps/app
pnpm install
```

### 2. Setup Environment Variables

Create a `.env` file in `apps/app`:

```bash
cp .env.example .env
```

Update the environment variables as needed:

```env
EXPO_PUBLIC_API_URL=http://localhost:8080/api
EXPO_PUBLIC_API_TIMEOUT=10000
EXPO_PUBLIC_ENV=development
```

### 3. Add Required Assets

The app requires the following assets to be added to the `assets` directory:

#### Required Images

1. **App Icon** (`assets/icon.png`)
   - Size: 1024x1024px
   - Format: PNG with transparency
   - Design: App icon with Forest Focus branding

2. **Splash Screen** (`assets/splash.png`)
   - Size: 1284x2778px (iPhone 13 Pro Max)
   - Format: PNG
   - Background: #EAF2FF
   - Design: Logo centered

3. **Adaptive Icon** (`assets/adaptive-icon.png`)
   - Size: 1024x1024px
   - Format: PNG with transparency
   - Design: Android adaptive icon (centered on 1024x1024 canvas)

4. **Favicon** (`assets/favicon.png`)
   - Size: 48x48px
   - Format: PNG
   - Design: Simplified app icon

You can generate placeholder assets using:

```bash
# From apps/app directory
npx expo prebuild --clean
```

## Development

### Start Development Server

```bash
# From workspace root
pnpm dev:app

# Or from app directory
cd apps/app
pnpm start
```

This will start the Expo dev server. You can then:

- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan the QR code with Expo Go app on your physical device

### Run on iOS

```bash
# From workspace root
pnpm app:ios

# Or from app directory
pnpm ios
```

### Run on Android

```bash
# From workspace root
pnpm app:android

# Or from app directory
pnpm android
```

### Run on Web

```bash
pnpm web
```

## Development with Dev Client

For a more production-like experience with custom native code:

### 1. Create Development Build

```bash
# iOS
eas build --profile development --platform ios

# Android
eas build --profile development --platform android
```

### 2. Install the Development Build

- iOS: Install the downloaded `.ipa` file on your device
- Android: Install the downloaded `.apk` file on your device or emulator

### 3. Start Dev Server

```bash
pnpm dev
```

The development build will connect to your dev server automatically.

## Building for Production

### Configure EAS Build

1. Login to EAS:

```bash
eas login
```

2. Configure the project:

```bash
eas build:configure
```

3. Update `eas.json` with your project details (Apple Team ID, etc.)

### Build for iOS

```bash
# Preview build (for TestFlight)
eas build --profile preview --platform ios

# Production build
eas build --profile production --platform ios
```

### Build for Android

```bash
# Preview build (APK)
eas build --profile preview --platform android

# Production build (AAB for Play Store)
eas build --profile production --platform android
```

## Testing

### Run Tests

```bash
pnpm test
```

### Watch Mode

```bash
pnpm test:watch
```

### Coverage

```bash
pnpm test:coverage
```

## Code Quality

### Linting

```bash
# Check for issues
pnpm lint

# Auto-fix issues
pnpm lint:fix
```

### Formatting

```bash
# Format code
pnpm format

# Check formatting
pnpm format:check
```

### Type Checking

```bash
pnpm type-check
```

## Monorepo Integration

The app is fully integrated with the pnpm monorepo:

### Access Shared Packages

```typescript
// Import from shared UI package
import { Button } from 'ui';

// TypeScript paths are configured
import { MyComponent } from '@/components/MyComponent';
```

### Run Multiple Apps

```bash
# Run web and server together
pnpm dev:all

# Add app to the mix (manually)
pnpm dev:app
```

## Troubleshooting

### Metro Bundler Issues

```bash
# Clear cache
pnpm clean:cache

# Start with cleared cache
pnpm start --clear
```

### iOS Build Issues

```bash
# Clean iOS build
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..

# Or use Expo's prebuild
expo prebuild --clean
```

### Android Build Issues

```bash
# Clean Android build
cd android
./gradlew clean
cd ..

# Or remove android folder and rebuild
rm -rf android
expo prebuild --clean
```

### Expo Secure Store Issues

If you get errors with SecureStore on iOS Simulator:

```typescript
// Use AsyncStorage as fallback for development
import AsyncStorage from '@react-native-async-storage/async-storage';

// In development, you might want to use AsyncStorage instead of SecureStore
```

### Metro Config Not Found

Ensure you're running commands from the correct directory. The metro bundler needs to be started from `apps/app`.

## Deployment

### Submit to App Store (iOS)

1. Build for production:

```bash
eas build --profile production --platform ios
```

2. Submit to App Store:

```bash
eas submit --platform ios
```

### Submit to Play Store (Android)

1. Create a service account key in Google Play Console

2. Download the JSON key file

3. Build for production:

```bash
eas build --profile production --platform android
```

4. Submit to Play Store:

```bash
eas submit --platform android
```

## Useful Commands

```bash
# Install a new dependency
pnpm add <package-name>

# Install a dev dependency
pnpm add -D <package-name>

# Remove a dependency
pnpm remove <package-name>

# Update dependencies
pnpm update

# Check outdated packages
pnpm outdated

# Clean install (remove node_modules and reinstall)
rm -rf node_modules && pnpm install
```

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [React Native Documentation](https://reactnative.dev/)

## Next Steps

1. ✅ Dependencies installed
2. ⬜ Environment variables configured
3. ⬜ Assets added (icon, splash, etc.)
4. ⬜ EAS configured (for builds)
5. ⬜ Connect to backend API
6. ⬜ Implement features
7. ⬜ Test on real devices
8. ⬜ Build and deploy

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review Expo documentation
3. Check GitHub issues
4. Contact the development team
