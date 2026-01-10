# Task Management API - Test Examples

## Authentication

All endpoints require authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access-token>
```

## 1. Create Task

**POST /api/tasks**

```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Study DBMS",
    "description": "Prepare for exam",
    "dueDate": "2026-01-15T10:00:00Z",
    "priority": "HIGH",
    "estimatedMinutes": 120
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "task": {
      "id": "...",
      "title": "Study DBMS",
      "status": "TODO",
      "priority": "HIGH",
      ...
    }
  }
}
```

## 2. List Tasks

**GET /api/tasks?status=TODO&priority=HIGH&page=1&limit=20**

```bash
curl -X GET "http://localhost:8080/api/tasks?status=TODO&priority=HIGH&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "Study DBMS",
      ...
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 20
  }
}
```

## 3. Get Single Task

**GET /api/tasks/:id**

```bash
curl -X GET http://localhost:8080/api/tasks/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 4. Update Task

**PUT /api/tasks/:id**

```bash
curl -X PUT http://localhost:8080/api/tasks/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated title",
    "status": "IN_PROGRESS",
    "priority": "URGENT"
  }'
```

## 5. Delete Task (Soft Delete)

**DELETE /api/tasks/:id**

```bash
curl -X DELETE http://localhost:8080/api/tasks/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 6. Mark Task Complete

**PATCH /api/tasks/:id/complete**

```bash
curl -X PATCH http://localhost:8080/api/tasks/507f1f77bcf86cd799439011/complete \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 7. AI Task Breakdown (PRO only)

**POST /api/tasks/ai-breakdown**

```bash
curl -X POST http://localhost:8080/api/tasks/ai-breakdown \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Study for DBMS exam in 3 days",
    "deadline": "2026-01-13T23:59:59Z",
    "priority": "HIGH"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "parentTask": { ... },
    "subtasks": [
      { "title": "Review course materials", ... },
      { "title": "Practice problems", ... },
      { "title": "Create study notes", ... }
    ]
  }
}
```

## 8. Bulk Delete

**POST /api/tasks/bulk-delete**

```bash
curl -X POST http://localhost:8080/api/tasks/bulk-delete \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taskIds": [
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439012",
      "507f1f77bcf86cd799439013"
    ]
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "deletedCount": 3
  },
  "message": "3 task(s) deleted successfully"
}
```

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": {
    "message": "Due date must be in the future",
    "code": "INVALID_DUE_DATE"
  }
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "message": "No token provided",
    "code": "UNAUTHORIZED"
  }
}
```

### 403 Forbidden (Subscription Required)

```json
{
  "success": false,
  "error": {
    "message": "Upgrade to Pro subscription required",
    "code": "SUBSCRIPTION_REQUIRED"
  }
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": {
    "message": "Task not found",
    "code": "TASK_NOT_FOUND"
  }
}
```

### 429 Too Many Requests

```json
{
  "success": false,
  "error": {
    "message": "Too many requests",
    "code": "RATE_LIMIT_EXCEEDED"
  }
}
```
