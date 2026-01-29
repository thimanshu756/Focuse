# 🧪 PHASE 1 TESTING GUIDE

This guide will walk you through testing all Phase 1 services to ensure they're working correctly.

---

## 🚀 Quick Start

### 1. Start the Development Server

```bash
cd apps/app
pnpm start
```

### 2. Open the App

- **Android Emulator:** Press `a` in the terminal
- **iOS Simulator:** Press `i` in the terminal
- **Physical Device:** Scan the QR code with Expo Go

### 3. Access the Test Screen

When the app starts, you'll see a yellow "🧪 Test Phase 1" button at the bottom of the loading screen (only visible in development mode). Tap it to open the test screen.

---

## 📋 Testing Checklist

### ✅ Automated Tests

On the test screen, tap **"Run All Tests"** to automatically test:

1. **Environment Validation** ✓
   - Verifies all environment variables are loaded
   - Shows current environment (development/staging/production)
   - Displays API URL

2. **Crash Reporting (Sentry)** ✓
   - Logs a test error to Sentry
   - Verifies Sentry is initialized
   - Check your Sentry dashboard to see the error

3. **Analytics (PostHog)** ✓
   - Tracks a test event
   - Verifies PostHog is initialized
   - Check your PostHog dashboard to see the event

4. **Database - Create Task** ✓
   - Creates a test task in SQLite
   - Retrieves the task to verify storage
   - Shows task details

5. **Database - Stats** ✓
   - Shows database statistics
   - Total tasks count
   - Unsynced items count
   - Sync queue count

6. **Sync Service Status** ✓
   - Shows if device is online
   - Shows if sync is in progress
   - Shows number of unsynced items

7. **Notifications - Init** ✓
   - Verifies notification service is initialized
   - Checks permissions status

---

### 🎯 Individual Tests

After running automated tests, try these individual tests:

#### 1. Test Immediate Notification

- **What it does:** Shows a notification immediately
- **Expected result:** You should see a notification in your device's notification tray
- **Troubleshooting:**
  - Make sure you granted notification permissions
  - Check notification settings in your device settings

#### 2. Test Scheduled Notification

- **What it does:** Schedules a notification to appear in 10 seconds
- **Expected result:** After 10 seconds, you should see a notification
- **Troubleshooting:**
  - Keep the app open or in background
  - Notification should appear even if app is closed

#### 3. Clear Test Data

- **What it does:** Deletes all test tasks from the database
- **Expected result:** Confirmation that tasks were deleted
- **Use case:** Clean up before running tests again

#### 4. Test Crash (⚠️ Destructive)

- **What it does:** Crashes the app to test crash reporting
- **Expected result:**
  - App will crash immediately
  - Reopen the app
  - Check Sentry dashboard to see the crash report
- **⚠️ WARNING:** This will close the app

---

## 🔍 Verification Steps

### 1. Check Sentry Dashboard

1. Go to [sentry.io](https://sentry.io)
2. Navigate to your project
3. Check **Issues** tab
4. You should see:
   - `[TEST] Phase 1 test error` (from automated test)
   - `[TEST] Crashlytics test crash` (if you ran crash test)
5. Click on an issue to see:
   - Stack trace
   - Device information
   - User context (if set)
   - Breadcrumbs

**Expected:**

- Error message visible
- Stack trace shows correct file and line
- Device info (model, OS version) present

### 2. Check PostHog Dashboard

1. Go to [posthog.com](https://app.posthog.com)
2. Navigate to your project
3. Check **Events** tab (Live Events)
4. You should see:
   - `phase1_test` event
   - `app_opened` event
   - Other tracked events

**Expected:**

- Events appear in real-time or within a few minutes
- Event properties show correctly
- Device properties captured

### 3. Check Database

The test screen shows database stats after running tests. You should see:

```
Tasks: [number] (should increase after test)
Unsynced: [number] (test tasks are unsynced)
Sync Queue: [number]
```

### 4. Check Notifications

**Immediate Notification:**

- Should appear instantly in notification tray
- Title: "🎉 Phase 1 Test"
- Body: "Notification system is working correctly!"

**Scheduled Notification:**

- Should appear exactly 10 seconds after scheduling
- Title: "⏰ Scheduled Test"
- Body: "This notification was scheduled 10 seconds ago"

---

## 🐛 Troubleshooting

### Sentry Not Working

**Symptoms:**

- Test shows "Sentry not initialized"
- No errors appearing in Sentry dashboard

**Solutions:**

1. **Check if DSN is set:**

   ```bash
   # In apps/app/.env.development
   EXPO_PUBLIC_SENTRY_DSN=https://YOUR-DSN@sentry.io/PROJECT-ID
   ```

2. **Verify Sentry project exists:**
   - Go to sentry.io
   - Create a new React Native project if needed
   - Copy the DSN from project settings

3. **Restart the app:**

   ```bash
   # Kill the server and restart
   pnpm start --clear
   ```

4. **Check Sentry initialization:**
   - Look for `[Crashlytics] Initialized successfully` in console
   - Look for any error messages

### PostHog Not Working

**Symptoms:**

- Test shows "PostHog not initialized"
- No events in PostHog dashboard

**Solutions:**

1. **Check if API key is set:**

   ```bash
   # In apps/app/.env.development
   EXPO_PUBLIC_POSTHOG_API_KEY=phc_YOUR-KEY
   EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   ```

2. **Verify PostHog project:**
   - Go to posthog.com
   - Create a new project if needed
   - Copy the API key from project settings

3. **Check PostHog initialization:**
   - Look for `[Analytics] Initialized successfully` in console
   - Events may take a few minutes to appear in dashboard

### Database Errors

**Symptoms:**

- "Database not initialized" error
- Can't create tasks
- Stats show 0 for everything

**Solutions:**

1. **Check initialization:**
   - Look for `[Database] Initialized successfully` in console
   - Check for any SQLite errors

2. **Clear app data:**

   ```bash
   # Android
   pnpm android
   # Then in device: Settings → Apps → Forest Focus → Clear Data

   # iOS
   Delete app and reinstall
   ```

3. **Verify expo-sqlite is installed:**
   ```bash
   cd apps/app
   pnpm install
   ```

### Notifications Not Working

**Symptoms:**

- No notification appears
- "Permission denied" errors
- Service not initialized

**Solutions:**

1. **Grant permissions:**
   - Android: Check notification settings in device settings
   - iOS: Grant permission when prompted

2. **Check if on physical device:**
   - Notifications don't work on some emulators
   - Test on a physical device

3. **Verify notification service:**
   - Look for `[Notifications] Initialized successfully` in console
   - Check for permission errors

4. **Test with Expo Go:**
   - If using custom dev client, make sure expo-notifications is linked
   - Try with Expo Go app first

### Sync Service Errors

**Symptoms:**

- Sync shows "offline" when you're online
- Unsynced items don't decrease
- Sync fails with errors

**Expected Behavior (Phase 1):**

- Sync will **fail** because backend endpoints don't exist yet
- This is **normal** - sync endpoints will be created in Phase 2
- You should see network status correctly (online/offline)
- Unsynced items will accumulate (this is expected)

**Verify:**

- Network status changes when you toggle airplane mode
- Sync queue contains the operations
- No crashes when sync fails

---

## 📊 Expected Test Results

After running all tests, you should see:

✅ **7 Successful Tests:**

1. Environment Validation ✓
2. Crash Reporting ✓ (if Sentry DSN configured)
3. Analytics ✓ (if PostHog key configured)
4. Database - Create Task ✓
5. Database - Stats ✓
6. Sync Service Status ✓
7. Notifications - Init ✓

**Service Status (Bottom of screen):**

- Crash Reporting: ✓ Active (if DSN configured)
- Analytics: ✓ Active (if API key configured)
- Database: ✓ Active
- Notifications: ✓ Active (if permissions granted)
- Environment: ✓ Active

---

## 📝 Test Report Template

After testing, create a test report:

```markdown
# Phase 1 Test Report

**Date:** [date]
**Tester:** [your name]
**Device:** [device model and OS version]

## Test Results

### Automated Tests

- [ ] Environment Validation: Pass/Fail
- [ ] Crash Reporting: Pass/Fail
- [ ] Analytics: Pass/Fail
- [ ] Database - Create Task: Pass/Fail
- [ ] Database - Stats: Pass/Fail
- [ ] Sync Service Status: Pass/Fail
- [ ] Notifications - Init: Pass/Fail

### Individual Tests

- [ ] Immediate Notification: Pass/Fail
- [ ] Scheduled Notification: Pass/Fail
- [ ] Crash Test: Pass/Fail

### Dashboard Verification

- [ ] Sentry: Errors visible
- [ ] PostHog: Events visible
- [ ] Notifications: Appearing correctly

## Issues Found

[List any issues encountered]

## Notes

[Additional observations]
```

---

## 🎯 Success Criteria

Phase 1 is considered **fully tested** when:

✅ All automated tests pass  
✅ Sentry dashboard shows test errors  
✅ PostHog dashboard shows test events  
✅ Notifications appear correctly  
✅ Database creates and retrieves tasks  
✅ Sync service shows correct online/offline status  
✅ No crashes during normal operation  
✅ Services initialize successfully on app launch

---

## 🚀 Next Steps

After successful testing:

1. **Document any issues** found during testing
2. **Update environment variables** for staging/production
3. **Set up CI/CD** for automated testing
4. **Proceed to Phase 2** - Feature implementation

---

## 📞 Need Help?

If you encounter issues not covered in this guide:

1. Check the console logs for detailed error messages
2. Review service initialization in app/\_layout.tsx
3. Verify all dependencies are installed (`pnpm install`)
4. Check that environment variables are loaded
5. Try cleaning the cache (`pnpm start --clear`)

---

**Last Updated:** January 26, 2026  
**Status:** Phase 1 Testing  
**Next:** Phase 2 Implementation
