# Database Migration Guide - Phase 0

## Changes Made

Phase 0 adds mobile sync capabilities to the database schema.

### New Models

#### Device

Tracks user devices for push notifications and activity monitoring.

```prisma
model Device {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  deviceId  String   @unique
  platform  String
  osVersion String?
  appVersion String
  pushToken String?
  lastSeenAt DateTime @default(now())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Modified Models

#### User

Added `lastSyncedAt` field for tracking last sync timestamp.

```prisma
model User {
  // ... existing fields
  lastSyncedAt DateTime? // NEW
  devices Device[]       // NEW relation
}
```

#### Task

Added `clientId` field for offline sync mapping.

```prisma
model Task {
  // ... existing fields
  clientId String? @unique // NEW
}
```

#### FocusSession

Added `clientId` field for offline sync mapping.

```prisma
model FocusSession {
  // ... existing fields
  clientId String? @unique // NEW
}
```

## Migration Steps

### 1. Backup Database (IMPORTANT!)

```bash
# MongoDB backup
mongodump --uri="your_connection_string" --out=/backup/forest-backup-$(date +%Y%m%d)
```

### 2. Generate Prisma Client

```bash
cd apps/server
pnpm db:generate
```

### 3. Create Migration

```bash
pnpm db:migrate
```

When prompted for migration name, use:

```
add_mobile_sync_support
```

This will:

- Create a new migration file
- Apply changes to the database
- Update Prisma client

### 4. Verify Migration

```bash
# Check database
pnpm db:studio

# Verify collections
# - devices (new)
# - users (has lastSyncedAt)
# - tasks (has clientId)
# - focus_sessions (has clientId)
```

### 5. Test API

```bash
# Start server
pnpm dev

# Test health endpoint
curl http://localhost:8080/api/health

# Should return: { "success": true, "data": { "status": "healthy", ... } }
```

## Rollback (if needed)

### Option 1: Revert Migration

```bash
cd apps/server
pnpm prisma migrate resolve --rolled-back add_mobile_sync_support
```

### Option 2: Restore from Backup

```bash
mongorestore --uri="your_connection_string" --drop /backup/forest-backup-YYYYMMDD
```

## Data Considerations

### Existing Data

- **No data loss**: All existing data remains intact
- **New fields**: `lastSyncedAt` and `clientId` are nullable, so existing records are valid
- **Indexes**: New indexes added for performance (clientId, lastSyncedAt)

### Performance Impact

- Migration adds 3 indexes:
  - `Device.deviceId` (unique)
  - `Task.clientId` (unique, sparse)
  - `FocusSession.clientId` (unique, sparse)
- Impact: Minimal, indexes created asynchronously in MongoDB

## Production Deployment Checklist

- [ ] Backup database
- [ ] Test migration in staging environment
- [ ] Verify API endpoints work
- [ ] Monitor error logs during deployment
- [ ] Check database indexes created successfully
- [ ] Test rollback procedure in staging

## Troubleshooting

### Migration fails with "Unique constraint violation"

**Cause**: Duplicate values in fields that need to be unique.

**Solution**:

```bash
# Check for duplicates
db.tasks.aggregate([
  { $group: { _id: "$clientId", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
])

# Remove duplicates (if any)
```

### Indexes not created

**Cause**: MongoDB Atlas may require manual index creation.

**Solution**: Check MongoDB Atlas UI and create indexes manually:

- `devices.deviceId` (unique)
- `tasks.clientId` (unique, sparse)
- `focus_sessions.clientId` (unique, sparse)

### "Collection not found" error

**Cause**: Prisma client not regenerated.

**Solution**:

```bash
pnpm db:generate
```

## Monitoring

After migration, monitor:

1. **Device registrations**:

   ```bash
   db.devices.countDocuments()
   ```

2. **Sync operations**:
   - Check logs for "Tasks synced" messages
   - Monitor conflict rates

3. **Performance**:
   - Query times for sync endpoints
   - Database connection pool usage

## Support

If issues occur:

1. Check server logs: `apps/server/logs/`
2. Review Prisma migration files: `apps/server/prisma/migrations/`
3. Verify schema: `apps/server/prisma/schema.prisma`

---

**Migration Status: Ready to Deploy** ✅
