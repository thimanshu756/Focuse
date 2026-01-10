# Focus Session & Timer API - Test Examples

## Authentication

All endpoints require authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access-token>
```

## 1. Start Focus Session

**POST /api/sessions**

```bash
curl -X POST http://localhost:8080/api/sessions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "507f1f77bcf86cd799439011",
    "duration": 25,
    "platform": "web",
    "deviceId": "device-123"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "session": {
      "id": "...",
      "userId": "...",
      "taskId": "...",
      "duration": 1500,
      "startTime": "2026-01-09T10:00:00Z",
      "endTime": "2026-01-09T10:25:00Z",
      "status": "RUNNING",
      "progress": 0,
      "task": {
        "id": "...",
        "title": "Study DBMS",
        "status": "IN_PROGRESS",
        "priority": "HIGH"
      }
    }
  }
}
```

## 2. List Sessions

**GET /api/sessions?status=COMPLETED&page=1&limit=20**

```bash
curl -X GET "http://localhost:8080/api/sessions?status=COMPLETED&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "status": "COMPLETED",
      "duration": 1500,
      "actualDuration": 1480,
      "startTime": "2026-01-09T10:00:00Z",
      "completedAt": "2026-01-09T10:24:40Z",
      "task": { ... }
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20
  }
}
```

## 3. Get Single Session

**GET /api/sessions/:id**

```bash
curl -X GET http://localhost:8080/api/sessions/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 4. Get Active Session

**GET /api/sessions/active**

```bash
curl -X GET http://localhost:8080/api/sessions/active \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response (if active):**

```json
{
  "success": true,
  "data": {
    "session": {
      "id": "...",
      "status": "RUNNING",
      "progress": 45,
      "timeElapsed": 675,
      ...
    }
  }
}
```

**Response (if no active session):**

```json
{
  "success": true,
  "data": {
    "session": null
  }
}
```

## 5. Pause Session

**PUT /api/sessions/:id/pause**

```bash
curl -X PUT http://localhost:8080/api/sessions/507f1f77bcf86cd799439011/pause \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "session": {
      "id": "...",
      "status": "PAUSED",
      "pausedAt": "2026-01-09T10:15:00Z",
      "progress": 60,
      ...
    }
  }
}
```

## 6. Resume Session

**PUT /api/sessions/:id/resume**

```bash
curl -X PUT http://localhost:8080/api/sessions/507f1f77bcf86cd799439011/resume \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 7. Complete Session

**PUT /api/sessions/:id/complete**

```bash
curl -X PUT http://localhost:8080/api/sessions/507f1f77bcf86cd799439011/complete \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "actualDuration": 1480
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "session": {
      "id": "...",
      "status": "COMPLETED",
      "completedAt": "2026-01-09T10:24:40Z",
      "actualDuration": 1480,
      "progress": 100,
      ...
    }
  },
  "message": "Session completed successfully"
}
```

## 8. Fail Session

**PUT /api/sessions/:id/fail**

```bash
curl -X PUT http://localhost:8080/api/sessions/507f1f77bcf86cd799439011/fail \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "USER_GAVE_UP"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "session": {
      "id": "...",
      "status": "FAILED",
      "failedAt": "2026-01-09T10:20:00Z",
      "reason": "USER_GAVE_UP",
      "progress": 80,
      ...
    }
  },
  "message": "Session marked as failed"
}
```

## 9. Get Session Statistics

**GET /api/sessions/stats?period=week**

```bash
curl -X GET "http://localhost:8080/api/sessions/stats?period=week" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalSessions": 25,
    "completedSessions": 20,
    "failedSessions": 5,
    "totalFocusTime": 45000,
    "averageSessionDuration": 1500,
    "completionRate": 80,
    "longestSession": 3600,
    "currentStreak": 7,
    "bestFocusTime": 14,
    "dailyBreakdown": [
      {
        "date": "2026-01-09",
        "sessions": 5,
        "focusTime": 9000,
        "completed": 4
      }
    ],
    "taskBreakdown": [
      {
        "taskId": "...",
        "taskTitle": "Study DBMS",
        "sessions": 3,
        "focusTime": 5400
      }
    ]
  }
}
```

## 10. Bulk Complete Sessions

**POST /api/sessions/bulk-complete**

```bash
curl -X POST http://localhost:8080/api/sessions/bulk-complete \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionIds": [
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439012"
    ]
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "completedCount": 2
  },
  "message": "2 session(s) auto-completed"
}
```

## Error Responses

### 409 Conflict - Active Session Exists

```json
{
  "success": false,
  "error": {
    "message": "Complete or cancel current session first",
    "code": "ACTIVE_SESSION_EXISTS"
  }
}
```

### 403 Forbidden - Session Limit Exceeded (FREE users)

```json
{
  "success": false,
  "error": {
    "message": "Free users limited to 3 sessions/day. Upgrade to Pro!",
    "code": "SESSION_LIMIT_EXCEEDED"
  }
}
```

### 400 Bad Request - Invalid Status

```json
{
  "success": false,
  "error": {
    "message": "Session is not running",
    "code": "INVALID_SESSION_STATUS"
  }
}
```

## Background Jobs

### Cleanup Stuck Sessions

Run every 5 minutes to mark expired sessions as FAILED:

```typescript
import { cleanupStuckSessions } from './jobs/cleanup-sessions.job.js';
await cleanupStuckSessions();
```

### Update Streaks

Run daily at midnight to update user streaks:

```typescript
import { updateStreaks } from './jobs/update-streaks.job.js';
await updateStreaks();
```
