# 🏗️ Building Development Client for Phase 1

Since Phase 1 uses native modules (SQLite, Sentry, etc.), you need a **development build** instead of Expo Go.

## 🚀 Quick Build (EAS - Recommended)

### Step 1: Install EAS CLI (if not already installed)

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

### Step 3: Build Development Client

```bash
cd apps/app

# For Android
eas build --profile development --platform android

# For iOS (Mac only)
eas build --profile development --platform ios
```

**Time:** ~10-15 minutes (first time)

### Step 4: Install on Device

After build completes:

- **Android:** Download APK from EAS dashboard and install
- **iOS:** Install via TestFlight or direct download

### Step 5: Run Development Server

```bash
cd apps/app
pnpm start --dev-client
```

Then open the app on your device - it will connect automatically!

---

## 🏠 Local Build (Alternative - Faster but requires setup)

If you have Android Studio / Xcode set up:

### Android (Local)

```bash
cd apps/app

# Prebuild native code
pnpm prebuild

# Build and run
pnpm android
```

### iOS (Local - Mac only)

```bash
cd apps/app

# Prebuild native code
pnpm prebuild

# Build and run
pnpm ios
```

---

## ⚡ Quick Test Alternative

If you want to test **without building** first, I can create a simplified version that works with Expo Go (but some features will be disabled).

Would you like me to:

1. **Build dev client** (recommended - full features)
2. **Create Expo Go version** (quick test - limited features)

---

## 📱 After Building

Once you have the dev client installed:

1. Run `pnpm start --dev-client`
2. Open the app on your device
3. It will automatically connect to Metro bundler
4. All Phase 1 features will work! ✅

---

## 🎯 Recommended Path

For Phase 1 testing, I recommend:

1. **Use EAS build** (cloud build - no local setup needed)
2. **Install APK on Android device**
3. **Run dev server** and test all features

This takes ~15 minutes but gives you full functionality!
