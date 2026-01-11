# Sylva API Documentation

Complete API reference for the Sylva Focus Timer application. All APIs follow a three-layer architecture (Routes → Controllers → Services) with comprehensive validation, authentication, and error handling.

## Base URL

```
http://localhost:8080/api
```

## Authentication

Most endpoints require authentication via JWT Bearer token:

```
Authorization: Bearer <access-token>
```

---

## 1. Authentication APIs (`/api/auth`)

### 1.1 POST /api/auth/register

**Description:** Register a new user account with email verification.

**Auth:** Not required

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "timezone": "America/New_York" // Optional, IANA timezone
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "emailVerified": false,
      "subscriptionTier": "FREE",
      "timezone": "America/New_York"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600
    }
  }
}
```

---

### 1.2 POST /api/auth/login

**Description:** Authenticate user and receive access/refresh tokens.

**Auth:** Not required

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "emailVerified": true,
      "subscriptionTier": "PRO"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600
    }
  }
}
```

---

### 1.3 POST /api/auth/refresh

**Description:** Refresh access token using refresh token.

**Auth:** Not required

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  }
}
```

---

### 1.4 POST /api/auth/logout

**Description:** Logout user and invalidate refresh token.

**Auth:** Required

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 1.5 POST /api/auth/verify-email

**Description:** Verify user email address using verification token.

**Auth:** Not required

**Request Body:**

```json
{
  "token": "verification-token-from-email"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### 1.6 POST /api/auth/resend-verification

**Description:** Resend email verification token.

**Auth:** Not required

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Verification email sent"
}
```

---

### 1.7 POST /api/auth/forgot-password

**Description:** Request password reset email.

**Auth:** Not required

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### 1.8 POST /api/auth/reset-password

**Description:** Reset password using reset token from email.

**Auth:** Not required

**Request Body:**

```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123!"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### 1.9 GET /api/auth/me

**Description:** Get current authenticated user's profile.

**Auth:** Required

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://...",
      "subscriptionTier": "PRO",
      "subscriptionStatus": "ACTIVE",
      "emailVerified": true,
      "timezone": "America/New_York",
      "currentStreak": 7,
      "totalFocusTime": 45000,
      "totalSessions": 30,
      "createdAt": "2026-01-01T00:00:00Z"
    }
  }
}
```

---

### 1.10 PATCH /api/auth/update-profile

**Description:** Update user profile (name, timezone, avatar).

**Auth:** Required

**Request Body:**

```json
{
  "name": "John Updated",
  "timezone": "America/Los_Angeles",
  "avatar": "https://..."
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Updated",
      "timezone": "America/Los_Angeles",
      "avatar": "https://..."
    }
  }
}
```

---

### 1.11 POST /api/auth/change-password

**Description:** Change password for authenticated user.

**Auth:** Required

**Request Body:**

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 2. Task Management APIs (`/api/tasks`)

### 2.1 POST /api/tasks

**Description:** Create a new task.

**Auth:** Required

**Request Body:**

```json
{
  "title": "Study DBMS",
  "description": "Prepare for exam",
  "dueDate": "2026-01-15T10:00:00Z",
  "priority": "HIGH",
  "estimatedMinutes": 120,
  "parentTaskId": "507f1f77bcf86cd799439011", // Optional
  "tagIds": ["tag1", "tag2"] // Optional
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "task": {
      "id": "507f1f77bcf86cd799439011",
      "title": "Study DBMS",
      "description": "Prepare for exam",
      "status": "TODO",
      "priority": "HIGH",
      "dueDate": "2026-01-15T10:00:00Z",
      "estimatedMinutes": 120,
      "actualMinutes": 0,
      "tagIds": ["tag1", "tag2"],
      "parentTaskId": null,
      "createdAt": "2026-01-10T10:00:00Z",
      "updatedAt": "2026-01-10T10:00:00Z"
    }
  }
}
```

---

### 2.2 GET /api/tasks

**Description:** List tasks with filters and pagination.

**Auth:** Required

**Query Parameters:**

- `status`: TODO | IN_PROGRESS | COMPLETED | ARCHIVED (optional)
- `priority`: LOW | MEDIUM | HIGH | URGENT (optional)
- `page`: number (default: 1)
- `limit`: number (default: 20, max: 100)

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "Study DBMS",
      "status": "TODO",
      "priority": "HIGH",
      "dueDate": "2026-01-15T10:00:00Z",
      "estimatedMinutes": 120,
      "createdAt": "2026-01-10T10:00:00Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20
  }
}
```

---

### 2.3 GET /api/tasks/:id

**Description:** Get a single task by ID with subtasks.

**Auth:** Required

**Response (200):**

```json
{
  "success": true,
  "data": {
    "task": {
      "id": "507f1f77bcf86cd799439011",
      "title": "Study DBMS",
      "status": "TODO",
      "priority": "HIGH",
      "subTasks": [
        {
          "id": "507f1f77bcf86cd799439012",
          "title": "Review course materials",
          "status": "TODO"
        }
      ]
    }
  }
}
```

---

### 2.4 PUT /api/tasks/:id

**Description:** Update a task.

**Auth:** Required

**Request Body:**

```json
{
  "title": "Updated title",
  "status": "IN_PROGRESS",
  "priority": "URGENT",
  "dueDate": "2026-01-16T10:00:00Z",
  "estimatedMinutes": 150
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "task": {
      "id": "507f1f77bcf86cd799439011",
      "title": "Updated title",
      "status": "IN_PROGRESS",
      "priority": "URGENT",
      "updatedAt": "2026-01-10T11:00:00Z"
    }
  }
}
```

---

### 2.5 DELETE /api/tasks/:id

**Description:** Soft delete a task (sets deletedAt timestamp).

**Auth:** Required

**Response (200):**

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

### 2.6 PATCH /api/tasks/:id/complete

**Description:** Mark a task as completed.

**Auth:** Required

**Response (200):**

```json
{
  "success": true,
  "data": {
    "task": {
      "id": "507f1f77bcf86cd799439011",
      "status": "COMPLETED",
      "completedAt": "2026-01-10T12:00:00Z"
    }
  }
}
```

---

### 2.7 POST /api/tasks/ai-breakdown

**Description:** Generate AI task breakdown (PRO subscription only).

**Auth:** Required (PRO/ENTERPRISE)

**Request Body:**

```json
{
  "prompt": "Study for DBMS exam in 3 days",
  "deadline": "2026-01-13T23:59:59Z",
  "priority": "HIGH"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "parentTask": {
      "id": "507f1f77bcf86cd799439011",
      "title": "AI Breakdown: Study for DBMS exam",
      "status": "TODO"
    },
    "subtasks": [
      {
        "id": "507f1f77bcf86cd799439012",
        "title": "Review course materials",
        "estimatedMinutes": 60
      },
      {
        "id": "507f1f77bcf86cd799439013",
        "title": "Practice problems",
        "estimatedMinutes": 90
      }
    ]
  }
}
```

---

### 2.8 POST /api/tasks/bulk-delete

**Description:** Bulk delete multiple tasks (max 50).

**Auth:** Required

**Request Body:**

```json
{
  "taskIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "deletedCount": 2
  },
  "message": "2 task(s) deleted successfully"
}
```

---

## 3. Focus Session APIs (`/api/sessions`)

### 3.1 POST /api/sessions

**Description:** Start a new focus session.

**Auth:** Required

**Request Body:**

```json
{
  "taskId": "507f1f77bcf86cd799439011", // Optional
  "duration": 25, // minutes (5-240)
  "platform": "web", // Optional: web | ios | android
  "deviceId": "device-123" // Optional
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "session": {
      "id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "taskId": "507f1f77bcf86cd799439013",
      "duration": 1500, // seconds
      "startTime": "2026-01-10T10:00:00Z",
      "endTime": "2026-01-10T10:25:00Z",
      "status": "RUNNING",
      "progress": 0,
      "timeElapsed": 0,
      "task": {
        "id": "507f1f77bcf86cd799439013",
        "title": "Study DBMS",
        "status": "IN_PROGRESS",
        "priority": "HIGH"
      }
    }
  }
}
```

---

### 3.2 GET /api/sessions

**Description:** List sessions with filters and pagination.

**Auth:** Required

**Query Parameters:**

- `status`: RUNNING | PAUSED | COMPLETED | FAILED (optional)
- `startDate`: ISO date (optional)
- `endDate`: ISO date (optional)
- `taskId`: string (optional)
- `page`: number (default: 1)
- `limit`: number (default: 20, max: 100)

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "status": "COMPLETED",
      "duration": 1500,
      "startTime": "2026-01-10T10:00:00Z",
      "endTime": "2026-01-10T10:25:00Z",
      "completedAt": "2026-01-10T10:24:40Z",
      "actualDuration": 1480,
      "progress": 100,
      "task": {
        "id": "507f1f77bcf86cd799439013",
        "title": "Study DBMS"
      }
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20
  }
}
```

---

### 3.3 GET /api/sessions/:id

**Description:** Get a single session by ID.

**Auth:** Required

**Response (200):**

```json
{
  "success": true,
  "data": {
    "session": {
      "id": "507f1f77bcf86cd799439011",
      "status": "RUNNING",
      "progress": 45,
      "startTime": "2026-01-10T10:00:00Z",
      "endTime": "2026-01-10T10:25:00Z",
      "timeElapsed": 675,
      "task": {
        "id": "507f1f77bcf86cd799439013",
        "title": "Study DBMS"
      }
    }
  }
}
```

---

### 3.4 GET /api/sessions/active

**Description:** Get currently active session (RUNNING or PAUSED).

**Auth:** Required

**Response (200):**

```json
{
  "success": true,
  "data": {
    "session": {
      "id": "507f1f77bcf86cd799439011",
      "status": "RUNNING",
      "progress": 45,
      "timeElapsed": 675
    }
  }
}
```

**Response (200) - No active session:**

```json
{
  "success": true,
  "data": {
    "session": null
  }
}
```

---

### 3.5 PUT /api/sessions/:id/pause

**Description:** Pause a running session.

**Auth:** Required

**Response (200):**

```json
{
  "success": true,
  "data": {
    "session": {
      "id": "507f1f77bcf86cd799439011",
      "status": "PAUSED",
      "pausedAt": "2026-01-10T10:15:00Z",
      "progress": 60,
      "timeElapsed": 900
    }
  }
}
```

---

### 3.6 PUT /api/sessions/:id/resume

**Description:** Resume a paused session.

**Auth:** Required

**Response (200):**

```json
{
  "success": true,
  "data": {
    "session": {
      "id": "507f1f77bcf86cd799439011",
      "status": "RUNNING",
      "pausedAt": null,
      "endTime": "2026-01-10T10:30:00Z" // Extended by pause duration
    }
  }
}
```

---

### 3.7 PUT /api/sessions/:id/complete

**Description:** Complete a session.

**Auth:** Required

**Request Body:**

```json
{
  "actualDuration": 1480 // Optional, seconds
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "session": {
      "id": "507f1f77bcf86cd799439011",
      "status": "COMPLETED",
      "completedAt": "2026-01-10T10:24:40Z",
      "actualDuration": 1480,
      "progress": 100
    }
  },
  "message": "Session completed successfully"
}
```

---

### 3.8 PUT /api/sessions/:id/fail

**Description:** Mark a session as failed.

**Auth:** Required

**Request Body:**

```json
{
  "reason": "USER_GAVE_UP" // USER_GAVE_UP | APP_BACKGROUNDED | APP_CRASHED | DISTRACTION_OPENED | TIMEOUT
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "session": {
      "id": "507f1f77bcf86cd799439011",
      "status": "FAILED",
      "failedAt": "2026-01-10T10:20:00Z",
      "reason": "USER_GAVE_UP",
      "progress": 80
    }
  },
  "message": "Session marked as failed"
}
```

---

### 3.9 GET /api/sessions/stats

**Description:** Get session statistics with breakdowns.

**Auth:** Required

**Query Parameters:**

- `period`: today | week | month | year | all (default: week)
- `startDate`: ISO date (optional)
- `endDate`: ISO date (optional)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "totalSessions": 25,
    "completedSessions": 20,
    "failedSessions": 5,
    "totalFocusTime": 45000, // seconds
    "averageSessionDuration": 1500, // seconds
    "completionRate": 80, // percentage
    "longestSession": 3600, // seconds
    "currentStreak": 7,
    "bestFocusTime": 14, // hour of day (0-23)
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
        "taskId": "507f1f77bcf86cd799439011",
        "taskTitle": "Study DBMS",
        "sessions": 3,
        "focusTime": 5400
      }
    ]
  }
}
```

---

### 3.10 POST /api/sessions/bulk-complete

**Description:** Bulk complete expired sessions (system use).

**Auth:** Required

**Request Body:**

```json
{
  "sessionIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "completedCount": 2
  },
  "message": "2 session(s) auto-completed"
}
```

---

## 4. Sync API (`/api/sync`)

### 4.1 POST /api/sync

**Description:** Delta sync for cross-device synchronization. Returns only data updated after lastSyncTime.

**Auth:** Required

**Request Body:**

```json
{
  "lastSyncTime": "2026-01-10T10:30:00Z", // Optional, null for initial sync
  "entities": ["sessions", "tasks", "user"] // Optional, defaults to all
}
```

**Response (200) - Delta Sync:**

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "507f1f77bcf86cd799439011",
        "status": "COMPLETED",
        "progress": 100,
        "startTime": "2026-01-10T10:30:00Z",
        "endTime": "2026-01-10T10:55:00Z",
        "taskId": "507f1f77bcf86cd799439012",
        "duration": 1500,
        "updatedAt": "2026-01-10T10:55:00Z"
      }
    ],
    "tasks": [
      {
        "id": "507f1f77bcf86cd799439012",
        "title": "Study DBMS",
        "status": "COMPLETED",
        "priority": "HIGH",
        "dueDate": "2026-01-15T10:00:00Z",
        "completedAt": "2026-01-10T10:55:00Z",
        "updatedAt": "2026-01-10T10:55:00Z"
      }
    ],
    "user": {
      "totalFocusTime": 46500,
      "currentStreak": 7,
      "completedSessions": 26,
      "totalSessions": 31
    },
    "timestamp": "2026-01-10T10:35:00Z"
  }
}
```

**Response (200) - No Changes:**

```json
{
  "success": true,
  "data": {
    "sessions": [],
    "tasks": [],
    "user": {
      "totalFocusTime": 46500,
      "currentStreak": 7,
      "completedSessions": 26,
      "totalSessions": 31
    },
    "timestamp": "2026-01-10T10:35:00Z"
  }
}
```

**Business Rules:**

- If `lastSyncTime` is null → returns all user data (initial sync)
- If `lastSyncTime` is in future → returns empty arrays
- If `lastSyncTime` > 7 days old → forces full sync
- Maximum 500 records per entity per sync
- Invalid entity names are ignored

---

## Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {} // Optional, additional error details
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` (401): Authentication required or invalid token
- `FORBIDDEN` (403): Insufficient permissions or subscription required
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid request data
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

---

## Rate Limits

- **Auth endpoints**: 10/min (register, login, password reset)
- **Verification**: 3/hour (resend verification)
- **Task creation**: 100/min
- **Task listing**: 200/min
- **AI breakdown**: 10/hour (PRO only)
- **Session creation**: 100/min
- **Session pause/resume**: 100/min
- **Session complete/fail**: 100/min
- **Bulk operations**: 20/min
- **Standard operations**: 100/min
- **Sync**: 100/min

---

## Notes

1. All timestamps are in ISO 8601 format (UTC)
2. All IDs are MongoDB ObjectIds (24-character hex strings)
3. Soft deletes are used for tasks (deletedAt timestamp)
4. Sessions are automatically failed if expired > 5 minutes
5. FREE users limited to 3 completed sessions/day
6. PRO users have unlimited sessions and AI breakdowns
7. All endpoints validate input using Zod schemas
8. All database operations use transactions for consistency
