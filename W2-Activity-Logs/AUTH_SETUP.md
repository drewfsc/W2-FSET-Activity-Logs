# Authentication System Setup Guide

## Overview

This W2 Activity Logs application now features a production-ready authentication system that:
- **Validates credentials** against an external MongoDB authentication database
- **Auto-creates local user accounts** when users log in for the first time
- **Protects all routes and API endpoints** with authentication middleware
- **Implements role-based access control** (client, coach, admin)

## Architecture

### Two-Database System

1. **External Auth Database** (`AUTH_MONGODB_URI`)
   - Stores authentication credentials (email + hashed passwords)
   - Validates user login attempts
   - Tracks last login timestamps
   - Model: `AuthUser` (in `models/AuthUser.ts`)

2. **Local W2 Database** (`MONGODB_URI`)
   - Stores user profile data (name, role, program, language, etc.)
   - Manages activity logs
   - Model: `User` (in `models/User.ts`)

### Authentication Flow

```
1. User enters email/password on /login
2. NextAuth sends credentials to auth database
3. Auth database validates password (bcrypt)
4. If valid, check if user exists in local W2 database
5. If not in local DB → create new user record
6. Generate JWT session token
7. User is logged in and redirected to /dashboard
```

## Setup Instructions

### 1. Create Environment Variables

Create a `.env.local` file in the project root:

```bash
# Local W2 Activity Logs Database
MONGODB_URI=mongodb://localhost:27017/w2-activity-logs
MONGODB_DB=w2-activity-logs

# External Authentication Database
AUTH_MONGODB_URI=mongodb://localhost:27017/auth-system
AUTH_MONGODB_DB=auth-system

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3001

# Generate a secret with: openssl rand -base64 32
NEXTAUTH_SECRET=your-generated-secret-key-here
```

### 2. Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and paste it as the value for `NEXTAUTH_SECRET` in `.env.local`.

### 3. Start MongoDB

Ensure MongoDB is running and accessible at the configured URIs:

```bash
# If using local MongoDB
mongod

# If using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Create Your First User

You have two options:

#### Option A: Use the Registration Page
1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3001/register`
3. Fill out the registration form
4. Select role (client or coach)
5. Submit to create account

#### Option B: Manually Insert into Auth Database
Use MongoDB shell or a GUI tool like MongoDB Compass:

```javascript
// Connect to auth-system database
use auth-system

// Insert a user with hashed password
// Password: "password123" (for testing only!)
db.authusers.insertOne({
  email: "user@example.com",
  password: "$2a$10$rGHvQVJ5yvZ7JQK5T5hM2O5Y5xPXZ5T5hM2O5Y5xPXZ5T5hM2O5Y5x",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

To generate a bcrypt hash for your own password, use this Node.js script:

```javascript
const bcrypt = require('bcryptjs');
const password = 'your-password-here';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
```

### 5. Start the Application

```bash
npm run dev
```

Visit `http://localhost:3001` and log in!

## File Structure

```
W2-Activity-Logs/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts          # NextAuth configuration
│   │   │   └── register/
│   │   │       └── route.ts          # User registration API
│   │   ├── activities/
│   │   │   ├── route.ts              # Protected activity endpoints
│   │   │   └── [id]/route.ts         # Protected single activity
│   │   └── users/
│   │       └── route.ts              # Protected user endpoints
│   ├── login/
│   │   └── page.tsx                  # Login page
│   ├── register/
│   │   └── page.tsx                  # Registration page
│   └── layout.tsx                    # Root layout with SessionProvider
├── components/
│   └── SessionProvider.tsx           # NextAuth session wrapper
├── lib/
│   ├── mongodb.ts                    # Local W2 database connection
│   └── authDb.ts                     # External auth database connection
├── models/
│   ├── User.ts                       # Local user model (updated)
│   ├── AuthUser.ts                   # External auth user model
│   └── Activity.ts                   # Activity model
├── types/
│   └── next-auth.d.ts                # NextAuth TypeScript types
├── middleware.ts                     # Route protection middleware
├── .env.example                      # Environment variable template
└── .env.local                        # Your actual environment variables (not in git)
```

## Features

### Authentication
- ✅ Secure password hashing with bcrypt
- ✅ JWT-based session management
- ✅ HTTP-only cookies
- ✅ Cross-database user synchronization
- ✅ Auto-account creation on first login
- ✅ Last login timestamp tracking

### Authorization (Role-Based Access Control)

#### Client Role
- Can only view/edit/delete their own activities
- Cannot access user lists
- Cannot create activities for others

#### Coach Role
- Can view all users and activities
- Can create activities for any user
- Can edit/delete any activity

#### Admin Role
- Full access to all endpoints
- Can create new users directly via API
- Can manage all data

### Protected Routes
- `/dashboard/*` - Requires authentication
- `/activities/*` - Requires authentication
- `/api/activities/*` - Requires authentication + authorization checks
- `/api/users/*` - Requires authentication (coaches/admins only)

### API Endpoints

#### Public Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - Login (NextAuth)

#### Protected Endpoints
- `GET /api/activities` - Get activities (filtered by role)
- `POST /api/activities` - Create activity
- `GET /api/activities/[id]` - Get single activity
- `PUT /api/activities/[id]` - Update activity
- `DELETE /api/activities/[id]` - Delete activity
- `GET /api/users` - List users (coaches/admins only)
- `POST /api/users` - Create user (admins only)

## Usage Examples

### Login from Frontend

```typescript
import { signIn } from 'next-auth/react';

const result = await signIn('credentials', {
  email: 'user@example.com',
  password: 'password123',
  role: 'client',
  redirect: false,
});

if (result?.ok) {
  // Login successful
  router.push('/dashboard');
}
```

### Get Current Session

```typescript
import { useSession } from 'next-auth/react';

function MyComponent() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') return <div>Not logged in</div>;

  return <div>Welcome, {session.user.name}!</div>;
}
```

### Logout

```typescript
import { signOut } from 'next-auth/react';

await signOut({ callbackUrl: '/login' });
```

### Server-Side Authentication Check

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // User is authenticated
  console.log(session.user.id, session.user.role);
}
```

## Security Considerations

### What's Implemented
✅ Password hashing (bcrypt with 10 salt rounds)
✅ JWT session tokens
✅ HTTP-only cookies
✅ Server-side session validation
✅ Role-based access control
✅ Protected API routes
✅ Environment-based secrets

### Production Recommendations
⚠️ Use a strong, randomly generated `NEXTAUTH_SECRET`
⚠️ Use HTTPS in production (`NEXTAUTH_URL=https://...`)
⚠️ Implement rate limiting on auth endpoints
⚠️ Add CSRF protection (built into NextAuth)
⚠️ Consider adding 2FA for sensitive accounts
⚠️ Implement account lockout after failed attempts
⚠️ Add password reset functionality
⚠️ Use MongoDB Atlas or managed database service
⚠️ Enable MongoDB authentication and encryption

## Troubleshooting

### "NEXTAUTH_SECRET is not set"
- Make sure `.env.local` exists and contains `NEXTAUTH_SECRET`
- Generate a new secret: `openssl rand -base64 32`

### "Cannot connect to MongoDB"
- Ensure MongoDB is running: `mongod`
- Check connection strings in `.env.local`
- Verify network/firewall settings

### "Invalid email or password"
- Verify user exists in auth database
- Check password hash was generated correctly
- Ensure email is lowercase in database

### "Unauthorized" on API calls
- Check if user is logged in
- Verify JWT token is being sent with requests
- Check middleware configuration

### Auto-account creation not working
- Verify `MONGODB_URI` is correct
- Check User model schema
- Look for errors in server logs

## Next Steps

### Recommended Enhancements
1. **Password Reset Flow**
   - Add "Forgot Password" link
   - Create password reset token system
   - Send reset emails

2. **Email Verification**
   - Add email verification on registration
   - Send verification emails
   - Mark accounts as verified

3. **Rate Limiting**
   - Install `express-rate-limit` or similar
   - Limit login attempts per IP
   - Implement account lockout

4. **Audit Logging**
   - Log all authentication events
   - Track failed login attempts
   - Monitor suspicious activity

5. **Two-Factor Authentication**
   - Add 2FA option for users
   - Use TOTP (Time-based One-Time Password)
   - Store recovery codes

## Support

For issues or questions about this authentication system:
1. Check this documentation
2. Review the code comments in the auth files
3. Check NextAuth.js documentation: https://next-auth.js.org/

## License

This authentication implementation follows the same license as the main W2 Activity Logs application.
