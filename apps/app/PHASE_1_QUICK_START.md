# 🚀 PHASE 1 QUICK START GUIDE

This guide will help you get started with the Phase 1 implementation of the Forest Focus mobile app.

---

## ✅ What's Been Implemented

Phase 1 provides the **production-ready infrastructure**:

- 🔥 **Crash Reporting** (Sentry)
- 📊 **Analytics** (PostHog)
- 💾 **Offline Storage** (SQLite)
- 🔄 **Sync Service** (with conflict resolution)
- 📱 **Push Notifications** (Expo Notifications)
- 🔒 **Environment Configuration** (Zod validation)
- 🚀 **OTA Updates** (Expo Updates)

---

## 📋 Prerequisites

Before running the app, you need:

1. **Node.js 18+** and **pnpm**
2. **Expo CLI** (`npm install -g expo-cli`)
3. **EAS CLI** (`npm install -g eas-cli`)
4. **Android Studio** (for Android development) or **Xcode** (for iOS)

---

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
# From the root of the project
pnpm install
```

### 2. Configure Environment Variables

Update the environment files with your API keys:

**For Development (`apps/app/.env.development`):**

```bash
# API (use your local server or staging server)
EXPO_PUBLIC_API_URL=http://localhost:8080/api

# Observability (leave empty for dev, or add keys for testing)
EXPO_PUBLIC_SENTRY_DSN=
EXPO_PUBLIC_POSTHOG_API_KEY=
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# EAS (get from expo.dev)
EXPO_PUBLIC_EAS_PROJECT_ID=
```

**For Production (`apps/app/.env.production`):**

```bash
# API
EXPO_PUBLIC_API_URL=https://api.forest-focus.com/api

# Observability
EXPO_PUBLIC_SENTRY_DSN=https://YOUR-SENTRY-DSN@sentry.io/PROJECT-ID
EXPO_PUBLIC_POSTHOG_API_KEY=phc_YOUR-POSTHOG-KEY
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# EAS
EXPO_PUBLIC_EAS_PROJECT_ID=your-eas-project-id
```

### 3. Create an Expo Account

If you don't have one:

```bash
eas login
```

### 4. Initialize EAS

```bash
cd apps/app
eas init
```

This will create an EAS project and give you a project ID. Add it to your `.env` files.

---

## 🏃 Running the App

### Development Mode (with Expo Go)

```bash
cd apps/app

# Start the development server
pnpm start

# Or start for specific platform
pnpm android  # Android emulator
pnpm ios      # iOS simulator
```

### Development Build (with custom native code)

For testing native features (notifications, etc.):

```bash
cd apps/app

# Build development client
eas build --profile development --platform android

# Or for iOS
eas build --profile development --platform ios

# Install on device and run
pnpm dev
```

---

## 🧪 Testing the Services

### Test Crash Reporting

Add this code to any screen temporarily:

```typescript
import { crashlyticsService } from '../src/services/crashlytics.service';

// Log a test error
crashlyticsService.testError();

// Or trigger a test crash (will crash the app)
// crashlyticsService.testCrash();
```

Then check your Sentry dashboard at [sentry.io](https://sentry.io).

### Test Analytics

```typescript
import { analyticsService } from '../src/services/analytics.service';

// Track a test event
analyticsService.trackEvent('test_button_clicked', {
  screen: 'Home',
  timestamp: new Date().toISOString(),
});

// Track screen view
analyticsService.trackScreen('HomeScreen');
```

Check your PostHog dashboard at [posthog.com](https://app.posthog.com).

### Test Offline Storage

```typescript
import { databaseService } from '../src/services/database.service';

// Create a test task
await databaseService.insertTask({
  id: `task-${Date.now()}`,
  title: 'Test Task',
  description: 'This is a test task created offline',
  priority: 'HIGH',
  status: 'TODO',
  userId: 'test-user-id',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Get all tasks
const tasks = await databaseService.getAllTasks('test-user-id');
console.log('Tasks:', tasks);

// Get database stats
const stats = await databaseService.getStats();
console.log('Stats:', stats);
```

### Test Sync Service

```typescript
import { syncService } from '../src/services/sync.service';

// Get sync status
const status = await syncService.getSyncStatus();
console.log('Sync status:', status);

// Force sync now (will attempt to sync with backend)
const result = await syncService.forceSyncNow();
console.log('Sync result:', result);
```

**Note:** Sync will fail if the backend endpoints don't exist yet. That's expected - they'll be created in Phase 2.

### Test Notifications

```typescript
import { notificationService } from '../src/services/notification.service';

// Show immediate notification
await notificationService.showNotification('test', {
  title: 'Test Notification',
  body: 'This is a test notification from Phase 1',
});

// Schedule notification in 10 seconds
const notificationId = await notificationService.scheduleNotification(
  'test',
  {
    title: 'Scheduled Test',
    body: 'This notification was scheduled 10 seconds ago',
  },
  10
);

console.log('Scheduled notification ID:', notificationId);
```

**Note:** You need to grant notification permissions first.

---

## 🔨 Building for Production

### Preview Build (Internal Testing)

```bash
cd apps/app

# Build APK for staging
eas build --profile preview --platform android
```

### Production Build

```bash
cd apps/app

# Build AAB for Google Play
eas build --profile production --platform android

# Or build APK for manual distribution
eas build --profile production-apk --platform android
```

---

## 📱 Testing on Physical Device

### Android

1. **Enable USB Debugging** on your device (Settings → Developer Options → USB Debugging)
2. **Connect via USB** and run:

```bash
cd apps/app
pnpm android
```

### iOS

1. **Install Expo Go** from the App Store
2. **Scan QR code** from the terminal
3. Or **build development client** and install via Xcode

---

## 🚀 OTA Updates

To push an OTA update (after initial app is installed):

```bash
cd apps/app

# Update staging channel
eas update --branch staging --message "Bug fixes"

# Update production channel
eas update --branch production --message "New features"
```

Users will receive the update on next app launch.

---

## 🐛 Common Issues

### 1. "Module not found" errors

```bash
cd apps/app
rm -rf node_modules
pnpm install
```

### 2. Metro bundler issues

```bash
cd apps/app
pnpm clean:cache
pnpm start --clear
```

### 3. TypeScript errors

```bash
cd apps/app
pnpm type-check
```

### 4. Build errors

```bash
cd apps/app
rm -rf .expo android ios
pnpm prebuild
```

### 5. "EXPO_PUBLIC_API_URL is not defined"

Make sure you have `.env.development` file in `apps/app/` directory.

---

## 📚 Next Steps

Phase 1 provides the infrastructure. To make the app functional, you need to:

1. **Phase 2:** Implement feature parity with web app
   - Authentication screens
   - Dashboard with stats
   - Tasks CRUD
   - Focus session timer
   - Forest view
   - Insights charts

2. **Backend API:** Implement sync endpoints
   - `POST /api/sync/tasks`
   - `POST /api/sync/sessions`
   - `POST /api/devices`

3. **Testing:** Write unit tests and E2E tests (Phase 4)

---

## 📖 Documentation

For detailed information about Phase 1 implementation, see:

- **[PHASE_1_IMPLEMENTATION_COMPLETE.md](../../PHASE_1_IMPLEMENTATION_COMPLETE.md)** - Complete implementation summary
- **[IMPLEMENTATION.md](../../IMPLEMENTATION.md)** - Overall project roadmap

---

## ❓ Need Help?

If you encounter issues:

1. Check the [Expo documentation](https://docs.expo.dev)
2. Check the [React Native documentation](https://reactnative.dev)
3. Check the implementation summary document
4. Review the service files in `src/services/`

---

**Status:** ✅ Phase 1 Complete  
**Next:** Phase 2 - Feature Parity with Web App  
**Last Updated:** January 26, 2026
