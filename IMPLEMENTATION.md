📋 FOREST FOCUS MOBILE - PRODUCTION IMPLEMENTATION PLAN
EXECUTIVE SUMMARY
Objective: Build production-grade Android app (v1.0) with iOS readiness, offline-first architecture, real-time sync, and comprehensive observability.

Key Requirements Met:

✅ Expo Push Notifications
✅ Offline task/session creation with sync
✅ Firebase Crashlytics + PostHog analytics
✅ Expo Updates (OTA)
✅ Google Play distribution
✅ WebView for legal/pricing
✅ Production-grade code (not MVP)
Timeline: 6-8 weeks (solo dev, production quality)

🎯 PHASED IMPLEMENTATION PLAN
PHASE 0: Foundation & Shared Packages
Goal: Eliminate code duplication, establish contracts between web/mobile/server

Tasks:
Create Shared Packages ✅

packages/types - API types, entities, enums
packages/validation - Zod schemas for forms
packages/api-client - Axios client, endpoints, hooks
packages/utils - Date formatting, string helpers
packages/config - Constants (API routes, durations)
Migrate Web App to Use Shared Packages ✅

Replace web's local types with @forest/types
Replace web's axios instance with @forest/api-client
Ensure web still builds and works (no regression)
Configure TypeScript for Workspace ✅

Create root tsconfig.base.json
Configure path aliases in all apps
Enable project references for faster builds
Backend API Changes for Mobile ⚠️ REQUIRED

Add /api/sync/tasks endpoint (batch create/update)
Add /api/sync/sessions endpoint (batch create/update)
Add /api/devices endpoint (register device, store push token)
Add lastSyncedAt field to User model
Add conflict resolution logic (server wins? client wins? merge?)
Add /api/health endpoint for app version checks
Acceptance Criteria:

All 5 shared packages exist with package.json + tsconfig.json
Web app imports from @forest/_ packages
Web app builds successfully (pnpm build)
Mobile app imports from @forest/_ packages
Mobile type-check passes (pnpm --filter app type-check)
Backend has 3 new endpoints: /sync/tasks, /sync/sessions, /devices
Definition of Done:

Web app in production still works (no downtime)
All packages have README with usage examples
Backend API docs updated with new endpoints
Postman collection updated
PHASE 1: Core Mobile Infrastructure
Goal: Production-ready foundation (monitoring, offline, security)

Tasks:
Observability Setup 🔥 CRITICAL

Install Firebase Crashlytics (expo install @react-native-firebase/crashlytics)
Install PostHog (posthog-react-native)
Create analytics wrapper (src/services/analytics.service.ts)
Create error tracking wrapper (src/services/crashlytics.service.ts)
Add error boundary with crash reporting
Configure source maps upload for EAS builds
Offline Storage Architecture 💾

Install WatermelonDB or SQLite (expo-sqlite)
Create local database schema (tasks, sessions, sync_queue)
Create sync service (src/services/sync.service.ts)
Implement conflict resolution strategy (last-write-wins with server timestamp)
Add network status listener
Create sync queue for pending operations
Security & Build Configuration 🔒

Enable Proguard/R8 in eas.json for production
Add expo-updates for OTA
Configure update channels (staging, production)
Create .env files (.env.development, .env.staging, .env.production)
Add environment validation on startup (Zod schema)
Remove hardcoded URLs from source code
Push Notifications Foundation 📱

Install expo-notifications
Create notification service (src/services/notification.service.ts)
Register device on login, send token to backend
Handle notification permissions (Android 13+)
Add notification event listeners
Create notification types (session_reminder, task_due, etc.)
Acceptance Criteria:

Crashlytics receives test crash
PostHog receives test event
Can create task offline, syncs when online
Can create session offline, syncs when online
Sync conflicts are resolved (server timestamp wins)
OTA update works (push update, app downloads it)
Push notification received on device
Environment variables loaded correctly (dev/staging/prod)
Definition of Done:

Crash reporting dashboard shows app version, device info
Analytics dashboard shows screen views, user actions
Offline sync tested with airplane mode
All secrets in .env, not in source code
Push notification shows up in notification tray
PHASE 2: Feature Parity with Web
Goal: Replicate all core features from Next.js app

Tasks:
Authentication Flows 🔐

Migrate login/signup screens to use @forest/api-client
Add email verification screen (WebView to /verify-email)
Add forgot password screen (WebView to /forgot-password)
Add reset password screen (WebView to /reset-password)
Add Google OAuth (React Native Google Sign-In)
Add biometric authentication (Face ID / Fingerprint)
Add auto-logout on 401 errors
Add token refresh background task
Dashboard Screen 📊

Create StatCard component (match web design)
Fetch user stats (today's focus time, tasks completed, streak)
Create QuickStart component (start session button)
Create TodayTasks list (next 3 tasks)
Create WeeklyChart (focus time trend)
Add pull-to-refresh
Add skeleton loading states
Track screen view in PostHog
Tasks Screen ✅

Create TaskList component (infinite scroll)
Create TaskCard component (swipe actions: edit, delete)
Create TaskModal (create/edit task)
Add AI breakdown integration (call Gemini API)
Add task filters (All, TODO, IN_PROGRESS, COMPLETED)
Add task search (debounced, 300ms)
Add empty state
Offline: Queue create/edit/delete, sync later
Focus Session Screen ⏱️

Create full-screen timer display
Add tree animation (Lottie or custom SVG animation)
Add pause/resume/cancel controls
Add background timer (keep running when app backgrounded)
Add notification when timer completes
Play completion sound
Show completion modal (confetti animation)
Track session events (start, pause, complete, fail)
Offline: Store session locally, sync when online
Forest Screen 🌲

Fetch forest data (/api/sessions/forest)
Create TreeGrid component (calendar view or grid)
Create TreeCard component (show session details)
Add tree growth animation on tap
Add filter by date range
Add empty state (no trees yet)
Track forest views
Insights Screen 📈

Fetch analytics data
Create focus time chart (daily/weekly)
Create productivity score card
Create task completion stats
Create longest streak card
Add date range picker
Add export option (share image or PDF)
Profile & Settings ⚙️

Create profile screen (not WebView)
Show user info (name, email, avatar)
Add subscription status display (fetch from backend)
Add settings: notifications, theme, sound
Add logout button
Add version info + update check
Add delete account option
Legal & Pricing (WebView) 📄

Create WebView wrapper component
Terms screen → WebView to https://yourwebapp.com/terms
Privacy screen → WebView to https://yourwebapp.com/privacy
Pricing screen → WebView to https://yourwebapp.com/pricing
Add error handling (network failure)
Add loading indicator
Acceptance Criteria:

All 8 web features replicated in mobile
Offline create task works, syncs on reconnect
Offline create session works, syncs on reconnect
Focus session runs in background (app minimized)
Timer completion triggers notification
Forest screen shows all past sessions
Analytics show correct data
Subscription status shown in profile
WebViews load successfully for terms/privacy/pricing
Definition of Done:

Manual QA checklist: 50+ test cases passed
No console errors or warnings
All screens have loading/error/empty states
All API calls have error handling
Analytics events firing correctly
Offline sync tested with 10+ tasks and sessions
PHASE 3: Polish & Performance
Goal: Production-quality UX, performance, accessibility

Tasks:
UI/UX Polish ✨

Implement design system from CLAUDE.md (colors, spacing, typography)
Add animations (Reanimated for 60fps)
Add haptic feedback (task complete, timer done)
Add skeleton loaders (all screens)
Optimize images (use expo-image, lazy loading)
Add optimistic UI updates (task create feels instant)
Add pull-to-refresh everywhere
Add error toast messages (react-native-toast-message)
Performance Optimization ⚡

Lazy load screens (React.lazy + Suspense)
Memoize expensive components (React.memo)
Optimize FlatList (windowSize, removeClippedSubviews)
Add pagination for tasks/sessions (load 20 at a time)
Compress API responses (gzip on backend)
Enable Hermes engine (already enabled in new RN)
Bundle size analysis (remove unused deps)
Test on low-end Android devices (3GB RAM)
Accessibility ♿

Add accessibility labels (all buttons, inputs)
Test with TalkBack (Android screen reader)
Ensure color contrast ratios (4.5:1 minimum)
Add focus indicators
Support text scaling (user font size preferences)
Test with accessibility scanner
Error Handling & Edge Cases 🛡️

Network timeout handling (show retry button)
API error handling (400, 401, 403, 500 responses)
Validation errors (show inline on forms)
Token expiry handling (auto-refresh)
App update required (force update if API version incompatible)
Sync conflict handling (show user which version to keep)
Session already in progress (prevent double start)
Acceptance Criteria:

All screens use design system colors/spacing
Animations run at 60fps (test with dev tools)
App loads in <3 seconds on 4G connection
Accessibility scanner: 0 errors
TalkBack navigation works correctly
All error scenarios tested (no crashes)
Haptic feedback on all major actions
Definition of Done:

Design review: matches web app aesthetic
Performance audit: no slow screens (>500ms render)
Accessibility audit: WCAG 2.1 AA compliant
Error scenarios: 20+ edge cases tested
PHASE 4: Testing & Quality Assurance
Goal: Zero critical bugs, comprehensive test coverage

Tasks:
Unit Tests 🧪

Write tests for all utils (date, validation, formatting)
Write tests for all stores (auth, sync, tasks)
Write tests for all services (API, sync, analytics)
Target: 80% code coverage for logic
Mock all external dependencies (API, storage)
Component Tests 🧩

Write tests for all UI components (Button, Card, TaskCard)
Write tests for screens (Dashboard, Tasks, Forest)
Use React Native Testing Library
Test user interactions (tap, swipe, scroll)
Test conditional rendering (loading, error, empty)
Integration Tests 🔗

Test auth flow (login → dashboard)
Test task creation flow (create offline → sync online)
Test session flow (start → pause → complete)
Test sync flow (create 5 tasks offline → sync)
Test error recovery (network failure → retry)
E2E Tests (Detox or Maestro) 🤖

Install Detox or Maestro
Write critical path tests:
Login → Create task → Start session → Complete
Offline create task → Go online → Verify synced
Receive push notification → Tap → Open session
Run on emulator in CI
Manual QA 👤

Create QA checklist (100+ test cases)
Test on 3 different Android devices (different OS versions)
Test offline scenarios (airplane mode, slow 3G)
Test background scenarios (session running, app killed)
Test notification scenarios (permission denied, etc.)
Test edge cases (empty states, error states)
Acceptance Criteria:

80% code coverage (utils, stores, services)
All components have tests
5 integration tests passing
3 E2E tests passing
QA checklist: 100% pass rate
No critical or high-severity bugs
Definition of Done:

CI runs all tests on every PR
Test reports generated (coverage, results)
QA sign-off document
No known bugs marked "blocker" or "critical"
PHASE 5: DevOps & Release Preparation (Week 6-7)
Goal: Automated builds, deployments, monitoring

Tasks:
CI/CD Pipeline 🔄

Create GitHub Actions workflow (.github/workflows/mobile-ci.yml)
On PR: Run lint, type-check, test, build preview
On merge to main: Build staging APK
On tag (v\*): Build production AAB, submit to Google Play
Upload source maps to Crashlytics
Send PostHog deployment event
EAS Build Configuration 📦

Create EAS project (eas init)
Configure build profiles:
development - dev client for debugging
preview - staging APK for internal testing
production - release AAB with obfuscation
Add secrets to EAS Secrets (API keys, tokens)
Test build locally (eas build --platform android --profile preview)
Google Play Setup 📲

Create Google Play Console app
Generate signing key, upload to EAS
Create internal testing track
Upload first APK manually
Configure store listing (title, description, screenshots)
Add privacy policy URL
Submit for review (internal testing first)
Expo Updates (OTA) Configuration 🚀

Configure update channels (staging, production)
Create update script (pnpm update:staging, pnpm update:prod)
Test OTA update flow (push update, app downloads)
Add update check on app launch
Add "update available" prompt
Monitoring & Alerts 📡

Set up Crashlytics alerts (Slack/email on crash spike)
Set up PostHog dashboards (DAU, session length, retention)
Create uptime monitor for API (UptimeRobot or Better Uptime)
Document runbook (how to respond to alerts)
Acceptance Criteria:

CI pipeline runs successfully
EAS build generates APK/AAB
App uploaded to Google Play Internal Testing
OTA update works (version 1.0.1 → 1.0.2)
Crashlytics dashboard shows data
PostHog dashboard shows users
Definition of Done:

CI/CD documented in README
Build instructions documented
Release process documented (step-by-step)
Alerts configured and tested
PHASE 6: Launch & Post-Launch
Goal: Public release, monitoring, iteration

Tasks:
Pre-Launch Checklist ✅

All features working
All tests passing
No critical bugs
Privacy policy updated
Terms of service updated
App store assets ready (icon, screenshots, description)
Analytics/crash reporting working
Backend scaled for load (if needed)
Support email configured
Internal Testing (1 week)

Distribute to internal testers (5-10 people)
Collect feedback (Google Form or Notion)
Fix bugs
Iterate on UX based on feedback
Closed Beta (1 week)

Promote to closed beta track (50-100 users)
Monitor crash rate (<1%)
Monitor analytics (session length, retention)
Fix critical issues
Production Release 🎉

Submit to Google Play production
Wait for review (1-3 days)
Once approved, gradual rollout (10% → 50% → 100%)
Monitor Crashlytics, PostHog, support emails
Be ready for hotfix if needed
Post-Launch Monitoring (Week 8+)

Daily: Check crash rate, ANR rate
Weekly: Review analytics (retention, DAU, session length)
Monthly: Review feature usage, plan next iteration
Iterate based on user feedback
Acceptance Criteria:

Internal testing: 10 testers, 50+ sessions
Closed beta: 50 users, 7 days, <1% crash rate
Production: Approved by Google Play
Post-launch: 7 days with no critical issues
Definition of Done:

App live on Google Play
Monitoring dashboards healthy
Support process established
Post-launch retrospective completed
📂 PROPOSED FOLDER STRUCTURE

forest/
├── apps/
│ ├── web/ # Next.js (existing)
│ ├── server/ # Express (existing)
│ └── app/ # React Native Expo
│ ├── .env.development # Local dev secrets
│ ├── .env.staging # Staging secrets
│ ├── .env.production # Production secrets (not in git)
│ ├── .env.example # Template
│ ├── app.config.ts # Expo config (dynamic)
│ ├── eas.json # EAS Build config
│ ├── app/ # Expo Router screens
│ │ ├── \_layout.tsx # Root layout
│ │ ├── index.tsx # Entry point (auth check)
│ │ ├── (tabs)/ # Main app tabs
│ │ │ ├── \_layout.tsx # Tab navigator
│ │ │ ├── index.tsx # Dashboard
│ │ │ ├── tasks.tsx # Tasks
│ │ │ ├── forest.tsx # Forest
│ │ │ └── insights.tsx # Insights
│ │ ├── auth/ # Auth screens
│ │ │ ├── login.tsx
│ │ │ ├── signup.tsx
│ │ │ └── biometric.tsx # Face ID / Fingerprint
│ │ ├── session/
│ │ │ └── [id].tsx # Focus session (full-screen)
│ │ ├── profile/
│ │ │ ├── index.tsx # Profile screen
│ │ │ └── settings.tsx # Settings
│ │ └── webview/ # WebView wrapper
│ │ ├── terms.tsx
│ │ ├── privacy.tsx
│ │ └── pricing.tsx
│ ├── src/
│ │ ├── components/ # UI components
│ │ │ ├── ui/ # Base components (Button, Card, Input)
│ │ │ ├── dashboard/ # Dashboard-specific
│ │ │ ├── tasks/ # Task-specific
│ │ │ ├── session/ # Session-specific
│ │ │ ├── forest/ # Forest-specific
│ │ │ └── shared/ # Cross-feature (Header, EmptyState)
│ │ ├── services/ # Business logic
│ │ │ ├── api.service.ts # Axios instance (use @forest/api-client)
│ │ │ ├── sync.service.ts # Offline sync manager
│ │ │ ├── analytics.service.ts # PostHog wrapper
│ │ │ ├── crashlytics.service.ts # Firebase wrapper
│ │ │ ├── notification.service.ts # Push notifications
│ │ │ ├── storage.service.ts # AsyncStorage wrapper
│ │ │ └── database.service.ts # SQLite/WatermelonDB
│ │ ├── stores/ # Zustand stores
│ │ │ ├── auth.store.ts
│ │ │ ├── tasks.store.ts
│ │ │ ├── session.store.ts
│ │ │ └── sync.store.ts
│ │ ├── hooks/ # Custom hooks
│ │ │ ├── useAuth.ts
│ │ │ ├── useTasks.ts
│ │ │ ├── useSync.ts
│ │ │ ├── useNetworkStatus.ts
│ │ │ └── usePushNotifications.ts
│ │ ├── utils/ # Re-export from @forest/utils
│ │ ├── types/ # Re-export from @forest/types
│ │ ├── constants/ # App-specific constants
│ │ │ ├── theme.ts # Design system
│ │ │ └── config.ts # App config (uses env vars)
│ │ └── navigation/ # Navigation helpers
│ │ └── types.ts # Type-safe routes
│ ├── **tests**/
│ │ ├── components/
│ │ ├── services/
│ │ ├── stores/
│ │ ├── utils/
│ │ └── integration/
│ └── assets/
│ ├── images/
│ ├── fonts/
│ ├── sounds/
│ └── animations/ # Lottie files
├── packages/ # Shared packages (NEW)
│ ├── types/ # TypeScript types
│ │ ├── package.json
│ │ ├── tsconfig.json
│ │ ├── index.ts
│ │ └── src/
│ │ ├── api.types.ts # API request/response types
│ │ ├── entities.types.ts # User, Task, Session entities
│ │ └── enums.types.ts # Status, Priority, etc.
│ ├── validation/ # Zod schemas
│ │ ├── package.json
│ │ ├── tsconfig.json
│ │ ├── index.ts
│ │ └── src/
│ │ ├── auth.schema.ts
│ │ ├── task.schema.ts
│ │ └── session.schema.ts
│ ├── api-client/ # API client
│ │ ├── package.json
│ │ ├── tsconfig.json
│ │ ├── index.ts
│ │ └── src/
│ │ ├── client.ts # Axios instance
│ │ ├── endpoints/
│ │ │ ├── auth.ts
│ │ │ ├── tasks.ts
│ │ │ ├── sessions.ts
│ │ │ ├── sync.ts # NEW: Batch sync endpoints
│ │ │ └── devices.ts # NEW: Device registration
│ │ └── hooks/ # React hooks (web + mobile)
│ │ ├── useAuth.ts
│ │ ├── useTasks.ts
│ │ └── useSessions.ts
│ ├── utils/ # Shared utilities
│ │ ├── package.json
│ │ ├── tsconfig.json
│ │ ├── index.ts
│ │ └── src/
│ │ ├── date.utils.ts
│ │ ├── string.utils.ts
│ │ └── validation.utils.ts
│ └── config/ # Shared constants
│ ├── package.json
│ ├── tsconfig.json
│ ├── index.ts
│ └── src/
│ ├── api-routes.ts # "/api/auth/login", etc.
│ └── constants.ts # Timer durations, limits
├── .github/
│ └── workflows/
│ ├── deploy-server.yml # Existing
│ ├── mobile-ci.yml # NEW: Mobile CI/CD
│ └── web-ci.yml # NEW: Web CI (optional)
├── tsconfig.base.json # NEW: Base TypeScript config
├── pnpm-workspace.yaml # Existing
└── package.json # Root package.json
🔑 KEY CONFIG FILES TO CREATE/MODIFY
New Files:
tsconfig.base.json - Shared TypeScript config
packages/_/package.json - 5 new packages
apps/app/.env.development - Dev environment vars
apps/app/.env.staging - Staging environment vars
apps/app/.env.production - Production secrets (gitignored)
.github/workflows/mobile-ci.yml - Mobile CI/CD pipeline
apps/app/src/services/sync.service.ts - Offline sync logic
apps/app/src/services/database.service.ts - Local SQLite
apps/app/src/services/analytics.service.ts - PostHog wrapper
apps/app/src/services/crashlytics.service.ts - Firebase wrapper
apps/app/src/services/notification.service.ts - Push notifications
Modified Files:
apps/app/eas.json - Add Proguard, secrets, source maps
apps/app/app.config.ts - Add Firebase config, updates config
apps/server/prisma/schema.prisma - Add Device, SyncQueue models
apps/server/src/index.ts - Add new routes (sync, devices)
apps/web/package.json - Add shared packages as dependencies
pnpm-workspace.yaml - Add packages/_ to workspace
⚠️ RISK REGISTER

# Risk Severity Probability Impact Mitigation

1 Offline sync conflicts HIGH MEDIUM Data loss, duplicate tasks Implement last-write-wins with server timestamp. Add manual conflict resolution UI. Test with 100+ offline operations.
2 Google Play rejection MEDIUM LOW Launch delay Follow Google Play policies strictly. No sensitive permissions. Privacy policy URL. Test with internal track first.
3 Push notification delivery failures MEDIUM MEDIUM Users miss reminders Implement local notifications as fallback. Log delivery failures to PostHog. Monitor delivery rate.
4 Background timer killed by Android HIGH HIGH Sessions lost Use foreground service for active sessions. Store session state every 10s. Add recovery on app restart.
5 API breaking changes (web vs mobile) HIGH MEDIUM Mobile app crashes Version API endpoints (/v1/tasks). Add API version check on app launch. Force update if incompatible.
6 EAS build failures MEDIUM MEDIUM Cannot release Test builds locally first. Pin all dependency versions. Use EAS build cache. Document build troubleshooting.
7 Expo Updates (OTA) breaks app HIGH LOW App unusable Test OTA updates on staging first. Keep previous version rollback option. Monitor crash rate after OTA.
8 Performance on low-end devices MEDIUM HIGH Poor UX, uninstalls Test on 3GB RAM device. Optimize images, lazy load screens. Use FlatList optimizations. Monitor performance metrics.
9 Crashlytics/PostHog not collecting data LOW MEDIUM Flying blind Test in staging first. Add health check on app launch. Alert if no data in 24h.
10 Solo dev burnout HIGH HIGH Project delay Break work into small PRs. Take breaks. Use AI copilots. Ship MVP first, iterate.
📋 BACKEND API CHANGES REQUIRED
NEW ENDPOINTS NEEDED:

1. Batch Sync - Tasks

POST /api/sync/tasks
Authorization: Bearer {token}

Request:
{
"clientId": "device-uuid",
"lastSyncedAt": "2026-01-26T10:00:00Z",
"operations": [
{
"id": "temp-id-123", // Client-generated temp ID
"operation": "CREATE",
"data": {
"title": "New task",
"priority": "HIGH"
},
"timestamp": "2026-01-26T10:05:00Z"
},
{
"id": "real-server-id",
"operation": "UPDATE",
"data": {
"status": "COMPLETED"
},
"timestamp": "2026-01-26T10:10:00Z"
}
]
}

Response:
{
"success": true,
"data": {
"synced": 2,
"conflicts": 0,
"mapping": {
"temp-id-123": "real-server-id-abc" // Map temp IDs to real IDs
},
"serverTasks": [...], // All tasks updated since lastSyncedAt
"lastSyncedAt": "2026-01-26T10:15:00Z"
}
}
Logic:

For each operation, check timestamp
If server timestamp > client timestamp: server wins (skip client update, send conflict warning)
If client timestamp > server timestamp: client wins (apply update)
Return mapping of temp IDs to real server IDs
Return all tasks modified on server since lastSyncedAt 2. Batch Sync - Sessions

POST /api/sync/sessions
Authorization: Bearer {token}

Request: (same structure as tasks)
Response: (same structure as tasks) 3. Device Registration

POST /api/devices
Authorization: Bearer {token}

Request:
{
"deviceId": "unique-device-id",
"platform": "android",
"osVersion": "14",
"appVersion": "1.0.0",
"pushToken": "ExponentPushToken[xxx]"
}

Response:
{
"success": true,
"data": {
"id": "device-id",
"registered": true
}
} 4. Health Check & Version Check

GET /api/health

Response:
{
"success": true,
"data": {
"status": "healthy",
"minAppVersion": "1.0.0", // Minimum supported app version
"latestAppVersion": "1.0.5", // Latest available version
"forceUpdate": false // Force update if client < minAppVersion
}
}
DATABASE SCHEMA CHANGES:
Add to prisma/schema.prisma:

model Device {
id String @id @default(auto()) @map("\_id") @db.ObjectId
userId String @db.ObjectId
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
deviceId String @unique
platform String // "android", "ios"
osVersion String?
appVersion String
pushToken String? // Expo push token
lastSeenAt DateTime @default(now())
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@index([userId])
@@map("devices")
}

model User {
// ... existing fields
devices Device[]
lastSyncedAt DateTime?
}

model Task {
// ... existing fields
clientId String? @unique // Temp ID from client (for mapping)
updatedAt DateTime @updatedAt // Make sure this exists
}

model Session {
// ... existing fields
clientId String? @unique
updatedAt DateTime @updatedAt
}
MIGRATION STEPS:
Create migration: pnpm --filter server db:migrate
Deploy migration: pnpm --filter server db:migrate:deploy
Add new routes in apps/server/src/routes/
Update API docs
🎯 DEFINITION OF DONE - ENTIRE PROJECT
Mobile app is production-ready when:

Functionality
All 8 core features working (auth, dashboard, tasks, session, forest, insights, profile, legal)
Offline create task/session works, syncs when online
Push notifications received and actionable
Background timer works (app minimized, session continues)
OTA updates work (version bump, app downloads)
Quality
80%+ code coverage (unit + integration tests)
3 E2E tests passing (critical paths)
0 ESLint errors/warnings
0 TypeScript errors
Manual QA: 100+ test cases passed
Tested on 3 different Android devices (OS 11, 12, 13+)
Performance
App loads in <3s on 4G
All screens render in <500ms
No memory leaks (test with React Native Debugger)
Battery usage <5% per hour (background session)
Security
All secrets in .env, not in source code
Proguard/R8 enabled for production builds
HTTPS only (no HTTP requests)
Token refresh works (7-day refresh token)
Observability
Crashlytics dashboard shows app version, OS, device
PostHog dashboard shows DAU, retention, session length
Source maps uploaded (crashes show readable stack traces)
Release
App uploaded to Google Play Internal Testing
10+ internal testers, 50+ sessions, <1% crash rate
CI/CD pipeline green (builds, tests, deploys)
Privacy policy published
Support email configured (support@yourapp.com)
