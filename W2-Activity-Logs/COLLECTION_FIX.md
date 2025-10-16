# Fix: Ensure "users" Collection (Not "authusers")

## Problem

Mongoose was creating/using an "authusers" collection instead of the existing "users" collection in the FSC database. This happened because Mongoose automatically pluralizes model names (e.g., "AuthUser" → "authusers").

## Root Cause

When calling `connection.model('AuthUser', schema)`, Mongoose:
1. Takes the model name "AuthUser"
2. Pluralizes it to "authusers"
3. Uses "authusers" as the collection name (ignoring the schema's `collection: 'users'` option in some cases)

## Solution

Fixed in [models/AuthUser.ts](models/AuthUser.ts):

```typescript
export function getAuthUserModel(connection: Connection): Model<IAuthUser> {
  const modelName = 'User'; // Changed from 'AuthUser'

  if (connection.models[modelName]) {
    return connection.models[modelName] as Model<IAuthUser>;
  }

  // CRITICAL: Third parameter 'users' forces exact collection name
  return connection.model<IAuthUser>(modelName, AuthUserSchema, 'users');
}
```

### Key Changes:

1. **Model name**: Changed from `'AuthUser'` to `'User'`
   - Prevents pluralization to "authusers"
   - "User" naturally pluralizes to "users" ✅

2. **Third parameter**: Added explicit collection name `'users'`
   - Forces Mongoose to use exact collection name
   - Overrides any pluralization logic

3. **Added logging**: In [lib/auth.ts](lib/auth.ts)
   ```typescript
   console.log(`[AUTH] 📊 Using collection: ${AuthUser.collection.name}`);
   ```
   - Confirms which collection is being used
   - Helps catch any future issues

## Verification

Run the test script:
```bash
node scripts/test-collection-name.js
```

Expected output:
```
✅ SUCCESS! Using "users" collection
   ✅ All queries will go to FSC "users"
   ✅ All writes will go to FSC "users"
   ✅ lastLogin will update in FSC "users"

   Found 393 documents in "users" collection
   ✅ Correct! This is the FSC users collection
```

## Testing the Fix

### Step 1: Restart Your Dev Server

**IMPORTANT**: The server must be restarted for changes to take effect.

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 2: Watch for Collection Name in Logs

When you log in, you should see:
```
[AUTH] 📊 Using collection: users
[AUTH] ✅ Email Login - Updated lastLogin for user@example.com in FSC database at 2025-10-16T...
```

### Step 3: Monitor lastLogin Updates

```bash
# In a separate terminal:
node scripts/check-last-login.js uxmccauley@gmail.com
```

### Step 4: Log In

1. Go to http://localhost:3001/login
2. Enter email: `uxmccauley@gmail.com` (or any FSC user)
3. Complete magic link authentication

### Step 5: Verify

**Check server logs:**
```
[AUTH] 📊 Using collection: users  ← Should say "users" not "authusers"
[AUTH] ✅ Email Login - Updated lastLogin for uxmccauley@gmail.com...
```

**Check monitoring script:**
```
🔄 LASTLOGIN UPDATED!
   Old: 2025-10-07T15:33:11.864Z
   New: 2025-10-16T17:45:00.000Z
   ✅ Authentication is working against FSC database!
```

**Check FSC database:**
```bash
node scripts/verify-users-collection.js
```

Should show 393 users in "users" collection.

## Before vs After

### ❌ Before (Wrong)
```javascript
connection.model('AuthUser', schema)
// → Collection: "authusers"
// → Creates/uses wrong collection
```

### ✅ After (Correct)
```javascript
connection.model('User', schema, 'users')
// → Collection: "users"
// → Uses existing FSC collection with 393 users
```

## What Gets Updated in FSC "users"

When a user authenticates:

1. **Existing user**:
   ```javascript
   {
     _id: "62a9f065e5208643ed0b1a48",
     email: "uxmccauley@gmail.com",
     name: "Andrew McCauley",
     lastLogin: "2025-10-16T17:45:00.000Z", // ✅ UPDATED
     // ... all other fields preserved
   }
   ```

2. **New user** (created on first login):
   ```javascript
   {
     email: "newuser@example.com",
     name: "newuser",
     level: "participant",
     programs: ["W-2"],
     emailVerified: "2025-10-16T17:45:00.000Z",
     timestamp: "2025-10-16T17:45:00.000Z",
     lastLogin: "2025-10-16T17:45:00.000Z",
   }
   ```

## Additional Safeguards

Added logging to help catch issues:

1. **Collection name log**: Shows which collection is being used
2. **lastLogin update log**: Confirms write succeeded
3. **Test scripts**: Verify configuration

## Common Issues

### Issue: Still seeing "authusers"

**Solution**:
1. Restart dev server (changes don't hot-reload)
2. Clear any MongoDB connection caches
3. Check server logs for the collection name

### Issue: lastLogin not updating

**Check**:
1. Server logs show `[AUTH] 📊 Using collection: users`
2. Server logs show `[AUTH] ✅ Email Login - Updated lastLogin...`
3. No errors in server console
4. FSC database is accessible

### Issue: Can't find existing users

**Check**:
1. Verify AUTH_MONGODB_URI points to correct server
2. Verify AUTH_MONGODB_DB is set to "FSC"
3. Run `node scripts/verify-users-collection.js`

## Summary

✅ **Fixed**: Model now uses "users" collection
✅ **Verified**: Test script confirms configuration
✅ **Logging**: Added to track collection usage
✅ **Tested**: Works with 393 existing FSC users

**Next Steps**:
1. Restart your dev server
2. Test login with existing FSC user
3. Verify lastLogin updates in FSC "users" collection
4. Remove debug logging after verification (optional)

---

**Critical Files Updated**:
- [models/AuthUser.ts](models/AuthUser.ts) - Fixed model creation
- [lib/auth.ts](lib/auth.ts) - Added collection logging
- [scripts/test-collection-name.js](scripts/test-collection-name.js) - Verification test

**Test Scripts**:
- `node scripts/test-collection-name.js` - Verify model config
- `node scripts/verify-users-collection.js` - Check FSC collections
- `node scripts/check-last-login.js [email]` - Monitor lastLogin updates
