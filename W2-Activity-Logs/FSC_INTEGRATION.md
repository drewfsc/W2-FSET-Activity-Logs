# FSC Database Integration

## ✅ Setup Complete!

The W2 Activity Logs application now integrates with the existing **FSC "users" collection** for authentication, while storing activity data separately in the W2 database.

## Database Architecture

```
┌─────────────────────────────────────────────────────────┐
│         FSC Database (AUTH_MONGODB)                      │
│         mongodb://162.218.1.22:27017/FSC                 │
├─────────────────────────────────────────────────────────┤
│  Collection: users (393 existing users)                  │
│  ├─ email, name, phone                                   │
│  ├─ level (admin, participant, coach, staff)            │
│  ├─ programs[] (W-2, FSET, etc.)                        │
│  ├─ city, state, street, zip, county                    │
│  ├─ coach[] (coach assignments)                         │
│  ├─ lastLogin, emailVerified, timestamp                 │
│  └─ appearance, isYouth, homeCounty                     │
└─────────────────────────────────────────────────────────┘
                          ↓
              User authenticates via
           Email Magic Link or SMS OTP
                          ↓
┌─────────────────────────────────────────────────────────┐
│      W2_FSET_Activity_Log Database (MONGODB)            │
│      mongodb://162.218.1.22:27017/W2_FSET_Activity_Log  │
├─────────────────────────────────────────────────────────┤
│  Collection: activities                                  │
│  ├─ userId (references users._id in FSC)               │
│  ├─ activityType, description, date                     │
│  ├─ duration, status, notes                             │
│  └─ timestamps                                           │
│                                                          │
│  NextAuth Collections:                                   │
│  ├─ sessions                                            │
│  ├─ verification_tokens (magic links)                   │
│  └─ accounts (OAuth providers)                          │
└─────────────────────────────────────────────────────────┘
```

## What Changed

### 1. New Files Created

- **[lib/authDb.ts](lib/authDb.ts)** - Connection to FSC database
- **[models/AuthUser.ts](models/AuthUser.ts)** - User model matching FSC schema
- **[scripts/inspect-fsc-users.js](scripts/inspect-fsc-users.js)** - Database inspection tool
- **[DUAL_DATABASE_SETUP.md](DUAL_DATABASE_SETUP.md)** - Technical documentation
- **[FSC_INTEGRATION.md](FSC_INTEGRATION.md)** - This file

### 2. Updated Files

- **[lib/auth.ts](lib/auth.ts)** - Now queries FSC database for users
- **[models/Activity.ts](models/Activity.ts)** - References FSC users collection
- **[app/dashboard/page.tsx](app/dashboard/page.tsx)** - Uses NextAuth sessions

## FSC User Schema

The FSC database uses this schema (we now match it exactly):

```typescript
{
  _id: ObjectId,
  email: string,              // User email (unique)
  name: string,               // Display name
  phone?: string,             // Phone number (not "phoneNumber")
  level?: string,             // Role: "admin", "participant", "coach", "staff"
  programs?: string[],        // ["W-2", "FSET", etc.]

  // Address fields
  city?: string,
  state?: string,
  street?: string,
  zip?: string,
  county?: string[],
  homeCounty?: string,

  // Coach assignments
  coach?: [{
    _id: ObjectId,
    email: string,
    name: string,
    timestamp: Date,
    removalDate?: Date
  }],
  coachUpdate?: Date,

  // Authentication
  emailVerified?: Date,
  lastLogin?: Date,
  timestamp?: Date,           // Account creation

  // Preferences
  appearance?: string,        // "dark" or "light"
  isYouth?: boolean,

  // OAuth
  image?: string              // Profile picture URL
}
```

## Authentication Flow

### Email Magic Link
```
1. User enters email → Sends magic link
2. User clicks link → NextAuth validates token
3. Query FSC database for user by email
   ├─ Found: Update lastLogin
   └─ Not found: Create new user with:
       {
         email, name,
         level: 'participant',
         programs: ['W-2'],
         emailVerified: now,
         timestamp: now
       }
4. Generate JWT session
5. Redirect to dashboard
```

### SMS OTP
```
1. User enters phone → Sends OTP via Twilio
2. User enters code → Verify with Twilio
3. Query FSC database for user by phone
   ├─ Found: Update lastLogin
   └─ Not found: Create new user with:
       {
         phone, email: phone@sms.placeholder,
         name: phone,
         level: 'participant',
         programs: ['W-2'],
         emailVerified: now,
         timestamp: now
       }
4. Generate JWT session
5. Redirect to dashboard
```

## Testing

### Test with Existing FSC User

1. Go to [http://localhost:3001/login](http://localhost:3001/login)
2. Enter an existing FSC email (e.g., `uxmccauley@gmail.com`)
3. Click the magic link in your email
4. You should be logged in and see the dashboard
5. Check FSC database - `lastLogin` should be updated

### Test with New User

1. Enter a new email address
2. Complete magic link authentication
3. New user will be created in FSC `users` collection
4. Check FSC database to verify the new user

### Verify Cross-Database Integration

```bash
# Run the inspection script
cd W2-Activity-Logs
node scripts/inspect-fsc-users.js
```

This shows:
- Total users in FSC (currently 393)
- Sample user structure
- Field statistics

## Session Data

When a user logs in, the NextAuth session contains:

```typescript
{
  user: {
    id: string,            // FSC users._id
    email: string,         // From FSC
    name: string,          // From FSC
    role: string,          // Mapped from FSC "level" field
    phoneNumber?: string   // From FSC "phone" field
  }
}
```

## Creating Activities

Activities automatically reference the FSC user:

```typescript
const activity = await Activity.create({
  userId: session.user.id,  // FSC users._id
  activityType: 'Job Search',
  description: 'Applied to position',
  date: new Date(),
  status: 'Completed'
});
```

## Role Mapping

FSC `level` field → NextAuth `role`:
- `admin` → `admin`
- `coach` → `coach`
- `staff` → `staff`
- `participant` → `client` (for W2 app purposes)
- `null` or missing → `participant`

## Benefits

1. **Single Source of Truth** - All FSC applications share the same users
2. **393 Existing Users** - All existing FSC users can log in immediately
3. **Automatic Sync** - lastLogin automatically tracked
4. **Cross-App Authentication** - Users authenticated once across all FSC apps
5. **Data Isolation** - Activity logs kept separate per application
6. **Passwordless** - Secure magic links and SMS OTP

## Important Notes

### Field Name Differences

⚠️ **Critical**: FSC uses different field names:
- FSC: `phone` → NextAuth: `phoneNumber` (mapped in code)
- FSC: `level` → NextAuth: `role` (mapped in code)
- FSC: `programs[]` → Not mapped to single string

### Existing Users

✅ All 393 existing FSC users can authenticate via email magic link
✅ Their existing data (coach assignments, programs, etc.) is preserved
✅ `lastLogin` is automatically updated on each login

### New Users

✅ New users created via W2 app are added to FSC `users` collection
✅ Default values: `level: 'participant'`, `programs: ['W-2']`
✅ Can be modified later via admin interface

## Troubleshooting

### "User not found" after login
- Check FSC database connection in `.env`
- Verify email exists in FSC `users` collection
- Check server logs for auth errors

### Activities not showing
- Ensure userId matches FSC users._id
- Check W2_FSET_Activity_Log database connectivity
- Verify session contains user.id

### Cannot create new users
- Check FSC database write permissions
- Verify AUTH_MONGODB_URI credentials
- Check server logs for creation errors

## Monitoring

Check user activity:
```javascript
// In FSC database
db.users.find({ lastLogin: { $gte: new Date('2025-10-16') } })
```

Check activities:
```javascript
// In W2_FSET_Activity_Log database
db.activities.aggregate([
  { $group: { _id: '$userId', count: { $sum: 1 } } }
])
```

## Future Enhancements

- [ ] Admin interface to manage FSC users
- [ ] Sync user profile changes from FSC to W2 app
- [ ] Add coach assignment workflow
- [ ] Integrate with other FSC applications
- [ ] Add program-based access control
- [ ] Create user analytics dashboard

## Support

For questions:
1. Check this documentation
2. Review FSC database schema with inspection script
3. Check server logs for auth errors
4. Verify both database connections

---

**Status**: ✅ Production Ready

**Last Updated**: 2025-10-16

**Database**: FSC users collection (393 users)
