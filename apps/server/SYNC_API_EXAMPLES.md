# Cross-Device Sync API - Test Examples

## Authentication

All endpoints require authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access-token>
```

## POST /api/sync - Delta Sync

### Initial Sync (No lastSyncTime)

**Request:**

```bash
curl -X POST http://localhost:8080/api/sync \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entities": ["sessions", "tasks", "user"]
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "507f1f77bcf86cd799439011",
        "status": "RUNNING",
        "progress": 45,
        "startTime": "2026-01-10T10:00:00Z",
        "endTime": "2026-01-10T10:25:00Z",
        "taskId": "507f1f77bcf86cd799439012",
        "duration": 1500,
        "updatedAt": "2026-01-10T10:15:00Z"
      }
    ],
    "tasks": [
      {
        "id": "507f1f77bcf86cd799439012",
        "title": "Study DBMS",
        "status": "IN_PROGRESS",
        "priority": "HIGH",
        "dueDate": "2026-01-15T10:00:00Z",
        "completedAt": null,
        "updatedAt": "2026-01-10T10:00:00Z"
      }
    ],
    "user": {
      "totalFocusTime": 45000,
      "currentStreak": 7,
      "completedSessions": 25,
      "totalSessions": 30
    },
    "timestamp": "2026-01-10T10:35:00Z"
  }
}
```

### Delta Sync (With lastSyncTime)

**Request:**

```bash
curl -X POST http://localhost:8080/api/sync \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lastSyncTime": "2026-01-10T10:30:00Z",
    "entities": ["sessions", "tasks", "user"]
  }'
```

**Response (with changes):**

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "507f1f77bcf86cd799439013",
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

### Delta Sync (No Changes)

**Request:**

```bash
curl -X POST http://localhost:8080/api/sync \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lastSyncTime": "2026-01-10T10:34:00Z",
    "entities": ["sessions", "tasks", "user"]
  }'
```

**Response:**

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

### Sync Specific Entities Only

**Request:**

```bash
curl -X POST http://localhost:8080/api/sync \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lastSyncTime": "2026-01-10T10:30:00Z",
    "entities": ["sessions"]
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "507f1f77bcf86cd799439013",
        "status": "COMPLETED",
        "progress": 100,
        "startTime": "2026-01-10T10:30:00Z",
        "endTime": "2026-01-10T10:55:00Z",
        "taskId": "507f1f77bcf86cd799439012",
        "duration": 1500,
        "updatedAt": "2026-01-10T10:55:00Z"
      }
    ],
    "tasks": [],
    "user": null,
    "timestamp": "2026-01-10T10:35:00Z"
  }
}
```

## Business Rules

### 1. Initial Sync (lastSyncTime is null)

- Returns all user data for the requested entities
- No filtering by updatedAt

### 2. Delta Sync (lastSyncTime provided)

- Returns only records updated after lastSyncTime
- Uses `updatedAt > lastSyncTime` filter

### 3. Future Timestamp

- If lastSyncTime is in the future, returns empty arrays
- User stats still returned if requested

### 4. Old Timestamp (> 7 days)

- Automatically forces full sync (treats as initial sync)
- Logs the action for debugging

### 5. No Changes

- Returns empty arrays for entities with no changes
- User stats always returned if requested (even if unchanged)

### 6. Invalid Entities

- Invalid entity names are ignored (not included in response)
- No error thrown

### 7. Record Limits

- Maximum 500 records per entity per sync
- Ordered by updatedAt descending (newest first)

## Edge Cases

### Future Timestamp

```json
{
  "lastSyncTime": "2026-12-31T23:59:59Z" // Future date
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "sessions": [],
    "tasks": [],
    "user": null,
    "timestamp": "2026-01-10T10:35:00Z"
  }
}
```

### Very Old Timestamp (> 7 days)

```json
{
  "lastSyncTime": "2026-01-01T00:00:00Z" // 9 days ago
}
```

**Response:** Full sync (all records returned)

### Invalid Entity Name

```json
{
  "entities": ["sessions", "invalid", "tasks"]
}
```

**Response:** Only sessions and tasks returned, "invalid" ignored

## Performance Notes

- Uses `select` to fetch only needed fields (lightweight response)
- Indexed on `userId` and `updatedAt` for fast queries
- Limits to 500 records per entity to prevent large payloads
- Orders by `updatedAt DESC` to get most recent changes first

## Usage Pattern

1. **First Sync:** Call without `lastSyncTime` to get all data
2. **Subsequent Syncs:** Use `timestamp` from previous response as `lastSyncTime`
3. **Polling:** Call sync endpoint every 30-60 seconds when app is active
4. **Background Sync:** Call sync when app comes to foreground

## Example Client Implementation

```typescript
let lastSyncTime: string | null = null;

async function sync() {
  const response = await fetch('/api/sync', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      lastSyncTime,
      entities: ['sessions', 'tasks', 'user'],
    }),
  });

  const { data } = await response.json();

  // Update local state with synced data
  updateLocalSessions(data.sessions);
  updateLocalTasks(data.tasks);
  updateLocalUser(data.user);

  // Store timestamp for next sync
  lastSyncTime = data.timestamp;
}

// Poll every 30 seconds
setInterval(sync, 30000);
```
