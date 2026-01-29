# 🔧 EAS Build Fix for Monorepo

The build is failing because EAS Build doesn't automatically handle pnpm monorepos. Here are the solutions:

## Solution 1: Use Local Build (Recommended for Development)

Instead of EAS Build, use **local builds** which work perfectly with pnpm:

```bash
cd apps/app

# One-time setup: Generate native folders
pnpm prebuild

# Daily development: Build and run
pnpm android  # For Android
pnpm ios      # For iOS (Mac only)
```

This gives you:

- ✅ Instant builds (no cloud upload)
- ✅ Hot reload works immediately
- ✅ Full pnpm workspace support
- ✅ No EAS Build needed for development

---

## Solution 2: Fix EAS Build for Monorepo

If you want to use EAS Build, you need to configure it for monorepo:

### Option A: Build from Root (Recommended)

1. Move `eas.json` to project root:

```bash
mv apps/app/eas.json ./eas.json
```

2. Update `eas.json` to specify the app directory:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      }
    }
  }
}
```

3. Create `app.json` at root pointing to app:

```json
{
  "expo": {
    "name": "Forest Focus",
    "slug": "forest-focus"
  }
}
```

### Option B: Copy Lockfile to App Directory

```bash
# Copy pnpm lockfile to app directory
cp pnpm-lock.yaml apps/app/
cp pnpm-workspace.yaml apps/app/
```

Then EAS will detect pnpm and use it.

---

## Solution 3: Use npm Instead (Quick Fix)

Convert to npm for EAS builds:

1. Delete `pnpm-lock.yaml`
2. Run `npm install` at root
3. EAS will use npm automatically

**Note:** This breaks your monorepo setup, not recommended.

---

## 🎯 My Recommendation

**For Phase 1 testing, use Local Build:**

1. Install Android Studio
2. Create AVD (Android Virtual Device)
3. Run `pnpm prebuild` once
4. Run `pnpm android` daily

This is:

- ✅ Faster than EAS Build
- ✅ Free (no EAS needed)
- ✅ Works with pnpm monorepo
- ✅ Hot reload works perfectly

Would you like me to help you set up local builds instead?
