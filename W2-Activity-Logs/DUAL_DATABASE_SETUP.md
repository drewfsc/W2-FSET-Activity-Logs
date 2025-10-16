# Dual Database Authentication Setup

## Overview

The W2 Activity Logs application now uses a **two-database architecture** with **passwordless authentication**:

1. **AUTH_MONGODB (FSC Database)** - Stores user authentication and profile data
2. **MONGODB (W2_FSET_Activity_Log)** - Stores activity logs and NextAuth session data

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Authentication                       │
│                                                               │
│  Email Magic Link  ──┐                                       │
│                      ├──> NextAuth ──> AUTH_MONGODB (FSC)    │
│  SMS OTP (Twilio) ──┘                   │                    │
│                                          │                    │
│                                          ▼                    │
│                                    AuthUser Model            │
│                              (email, phone, name, role)      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Activity Management                        │
│                                                               │
│  Activity Logs ──> MONGODB (W2_FSET_Activity_Log)           │
│                          │                                    │
│                          ▼                                    │
│                    Activity Model                            │
│              (userId, type, description, date)               │
│                          │                                    │
│                          │ References                         │
│                          ▼                                    │
│                    AuthUser._id (FSC)                        │
└─────────────────────────────────────────────────────────────┘
```

## Database Structure

### AUTH_MONGODB (FSC Database)
**Purpose**: Central authentication database for all FSC applications

**Collections**:
- `users` - User authentication and profile data (393 existing users)

**Fields in users collection**:
```typescript
{
  _id: ObjectId,
  email: string,                    // User email (unique)
  phoneNumber?: string,             // User phone (optional, unique if set)
  name: string,                     // Display name
  role: 'client' | 'coach' | 'admin',
  program: 'W-2' | 'FSET',          // Which program the user belongs to
  language: 'en' | 'es' | 'hmn',    // Preferred language
  isVerified: boolean,              // Email/phone verified
  isActive: boolean,                // Account active status
  address?: string,
  lastLogin?: Date,                 // Last login timestamp
  createdAt: Date,
  updatedAt: Date
}
```

### MONGODB (W2_FSET_Activity_Log Database)
**Purpose**: Application-specific activity tracking

**Collections**:
- `activities` - Activity logs
- `accounts` - NextAuth OAuth accounts (if using social login)
- `sessions` - NextAuth sessions
- `verification_tokens` - NextAuth magic link tokens

**Fields in Activity**:
```typescript
{
  _id: ObjectId,
  userId: ObjectId,                 // References AuthUser._id in FSC database
  activityType: string,             // 'Job Search', 'Interview', etc.
  description: string,
  date: Date,
  duration?: number,                // Minutes
  status: 'Pending' | 'Completed' | 'Cancelled',
  notes?: string,
  attachments?: string[],
  createdAt: Date,
  updatedAt: Date
}
```

## Authentication Flow

### Email Magic Link
```
1. User enters email on /login
2. NextAuth sends magic link via SendGrid
3. User clicks link in email
4. NextAuth validates token
5. Check if user exists in AUTH_MONGODB (FSC)
   ├─ If exists: Update lastLogin
   └─ If not: Create new AuthUser with default values
6. Generate JWT session token
7. Redirect to /dashboard
```

### SMS OTP
```
1. User enters phone number on /login
2. User clicks "Send Verification Code"
3. Backend sends OTP via Twilio Verify
4. User enters 6-digit code
5. Backend verifies code with Twilio
6. Check if user exists in AUTH_MONGODB (FSC)
   ├─ If exists: Update lastLogin
   └─ If not: Create new AuthUser with phone number
7. Generate JWT session token
8. Redirect to /dashboard
```

## Environment Variables

```bash
# AUTH Database (FSC) - User Authentication
AUTH_MONGODB_URI=mongodb://VercelMDB:password@162.218.1.22:27017/?authMechanism=DEFAULT
AUTH_MONGODB_DB=FSC

# Local Database - Activity Logs
MONGODB_URI=mongodb://VercelMDB:password@162.218.1.22:27017/?authMechanism=DEFAULT
MONGODB_DB=W2_FSET_Activity_Log

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-here

# Email Provider (SendGrid)
EMAIL_SERVER=smtp://apikey:YOUR_SENDGRID_API_KEY@smtp.sendgrid.net:587
EMAIL_FROM=no_reply_tts@fsc-corp.org

# SMS Provider (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxx
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxx
```

## File Structure

```
lib/
├── mongodb.ts           # Connection to W2_FSET_Activity_Log database
├── mongodb-client.ts    # MongoClient for NextAuth adapter
├── authDb.ts           # Connection to AUTH_MONGODB (FSC) database
└── auth.ts             # NextAuth configuration

models/
├── AuthUser.ts         # User model for FSC database
└── Activity.ts         # Activity model for W2 database

app/
├── api/
│   ├── auth/
│   │   └── [...nextauth]/route.ts  # NextAuth API routes
│   └── activities/
│       └── route.ts                # Activity CRUD operations
├── login/page.tsx                   # Login page with email/SMS
└── dashboard/page.tsx               # Dashboard (protected)
```

## Key Implementation Details

### 1. Separate Database Connections

**authDb.ts** creates a separate mongoose connection to AUTH_MONGODB:
```typescript
const authConnection = await authDbConnect();
const AuthUser = getAuthUserModel(authConnection);
```

**mongodb.ts** connects to the local W2 database for activities:
```typescript
await dbConnect();
const Activity = mongoose.model('Activity');
```

### 2. Cross-Database References

Activities reference users via ObjectId:
```typescript
userId: {
  type: Schema.Types.ObjectId,
  ref: 'AuthUser',  // References user in AUTH_MONGODB
  required: true,
}
```

To fetch user data with activities, you need to:
1. Get activity with userId
2. Query AUTH_MONGODB separately for user details

```typescript
// Get activity from W2 database
const activity = await Activity.findById(activityId);

// Get user from AUTH database
const authConnection = await authDbConnect();
const AuthUser = getAuthUserModel(authConnection);
const user = await AuthUser.findById(activity.userId);
```

### 3. Session Management

NextAuth sessions are stored in the **W2 database** (via MongoDBAdapter), but user data comes from **AUTH_MONGODB**:

```typescript
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      // Fetch user from AUTH database
      const authConnection = await authDbConnect();
      const AuthUser = getAuthUserModel(authConnection);
      const authUser = await AuthUser.findOne({ email: user.email });

      // Store in JWT token
      token.id = String(authUser._id);
      token.role = authUser.role;
    }
    return token;
  }
}
```

## Benefits of This Architecture

1. **Centralized User Management** - All FSC applications can share the same user database
2. **Application Isolation** - Each app has its own activity/data database
3. **Passwordless Security** - No password storage or management needed
4. **Flexible Authentication** - Support both email and SMS
5. **Cross-Application Single Sign-On** - Users can authenticate once across FSC apps

## API Usage Examples

### Get Current User from Session
```typescript
import { useSession } from 'next-auth/react';

const { data: session } = useSession();
// session.user.id -> AuthUser._id from FSC database
// session.user.email -> From AUTH_MONGODB
// session.user.role -> From AUTH_MONGODB
```

### Create Activity with Current User
```typescript
const response = await fetch('/api/activities', {
  method: 'POST',
  body: JSON.stringify({
    userId: session.user.id,  // AuthUser._id from FSC
    activityType: 'Job Search',
    description: 'Applied to Software Engineer position',
    date: new Date(),
  })
});
```

### Query User's Activities
```typescript
// This happens automatically - activities are filtered by userId
const response = await fetch('/api/activities');
// Returns activities where userId = session.user.id
```

## Migration Notes

If you have existing users in the old W2 User model:

1. **Export users from W2 database**
2. **Transform to AuthUser schema**
3. **Import into FSC database**
4. **Update activity userId references**

Migration script needed? Let me know!

## Security Considerations

✅ **Implemented**:
- Passwordless authentication (no password leaks)
- JWT session tokens
- HTTP-only cookies
- Separate databases (isolation)
- Email verification via magic links
- SMS verification via Twilio
- Role-based access control

⚠️ **Recommendations**:
- Use HTTPS in production
- Implement rate limiting on auth endpoints
- Add IP-based throttling
- Monitor failed authentication attempts
- Set up backup/disaster recovery
- Enable MongoDB authentication and encryption at rest

## Troubleshooting

### "Cannot connect to AUTH_MONGODB"
- Verify `AUTH_MONGODB_URI` is correct in `.env`
- Check network connectivity to 162.218.1.22:27017
- Verify credentials are URL-encoded
- Test connection with MongoDB Compass

### "User not found" errors
- Check that user was created in FSC database (not W2 database)
- Verify AUTH_MONGODB_DB is set to "FSC"
- Look for user in `authusers` collection

### Activities not showing
- Ensure userId in activities matches AuthUser._id from FSC
- Check that activities are in W2_FSET_Activity_Log database
- Verify MONGODB_DB is set correctly

### Session issues
- Clear browser cookies
- Restart dev server
- Check NEXTAUTH_SECRET is set
- Verify both databases are accessible

## Support

For questions about this architecture:
1. Check this documentation
2. Review the code in lib/auth.ts and models/AuthUser.ts
3. Test authentication flow with console.log debugging
4. Check both database connections

## Future Enhancements

- [ ] Add Google OAuth provider
- [ ] Implement 2FA for sensitive roles
- [ ] Add audit logging for user actions
- [ ] Create admin panel for user management
- [ ] Implement password reset (if adding password auth)
- [ ] Add email change workflow
- [ ] Create user migration tools
