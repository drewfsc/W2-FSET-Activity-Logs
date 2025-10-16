# Passwordless Authentication Setup Guide

## Overview

The W2 Activity Logs application uses **passwordless authentication** with two methods:
1. **Magic Link via Email** - Users receive a one-time link via email
2. **SMS OTP** - Users receive a 6-digit verification code via SMS

Both methods automatically create user accounts on first login - no separate registration needed!

## Architecture

### Single Database System
- **Local W2 Database** - Stores all user data and activity logs
- **NextAuth Adapter Collections** - Stores magic link tokens, sessions, and verification data
- **MongoDB Atlas or Local MongoDB** - Recommended for production

### Authentication Flow

**Email Magic Link:**
```
1. User enters email on /login
2. NextAuth sends magic link to email
3. User clicks link in email
4. NextAuth validates token
5. Check if user exists in database
6. If not, create new user automatically
7. User is logged in → redirect to /dashboard
```

**SMS OTP:**
```
1. User enters phone number on /login
2. Call /api/auth/sms/send-otp endpoint
3. Twilio sends 6-digit code via SMS
4. User enters code
5. Verify code with Twilio
6. Check if user exists in database
7. If not, create new user automatically
8. User is logged in → redirect to /dashboard
```

## Setup Instructions

### 1. Environment Variables

Create `.env.local` in the project root:

```bash
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/w2-activity-logs
MONGODB_DB=w2-activity-logs

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3001

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-generated-secret-key-here

# === EMAIL PROVIDER (Choose one) ===

# Option 1: SMTP (Gmail, Outlook, etc.)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourapp.com

# Option 2: Resend (Recommended for Production)
# RESEND_API_KEY=re_xxxxxxxxxxxx
# EMAIL_FROM=onboarding@resend.dev

# === SMS PROVIDER (Twilio) ===
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_VERIFY_SERVICE_SID=your-verify-service-sid
```

### 2. Email Provider Setup

#### Option A: Gmail SMTP (Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Create an App Password:**
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this as `EMAIL_SERVER_PASSWORD`

3. **Configure environment:**
```bash
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=yourname@gmail.com
EMAIL_SERVER_PASSWORD=your-16-char-app-password
EMAIL_FROM=noreply@yourapp.com
```

#### Option B: Resend (Production - Recommended)

1. **Sign up at [resend.com](https://resend.com)**
2. **Get API Key:**
   - Dashboard → API Keys → Create API Key
   - Copy the key starting with `re_`

3. **Verify your domain** (for production):
   - Dashboard → Domains → Add Domain
   - Add DNS records to your domain

4. **Configure environment:**
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

5. **Update `lib/auth.ts`** to use Resend:
```typescript
import { Resend } from 'resend';

EmailProvider({
  server: {
    host: 'smtp.resend.com',
    port: 465,
    auth: {
      user: 'resend',
      pass: process.env.RESEND_API_KEY,
    },
  },
  from: process.env.EMAIL_FROM,
})
```

### 3. SMS Provider Setup (Twilio)

1. **Sign up at [twilio.com](https://www.twilio.com/try-twilio)**
   - Get $15 free credit

2. **Get Account Credentials:**
   - Dashboard → Account Info
   - Copy **Account SID** and **Auth Token**

3. **Create Verify Service:**
   - Console → Verify → Services
   - Click "Create new service"
   - Name it (e.g., "W2 Activity Logs")
   - Copy the **Service SID**

4. **Configure environment:**
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

5. **For Development:**
   - Use your own phone number for testing
   - Twilio trial accounts can only send to verified numbers
   - Add verified numbers in Console → Phone Numbers → Verified Caller IDs

6. **For Production:**
   - Upgrade your Twilio account
   - Can send to any number
   - Consider adding your own phone number as sender

### 4. Database Setup

```bash
# Start MongoDB (if using local)
mongod

# Or use MongoDB Atlas (recommended for production)
# Get connection string from atlas.mongodb.com
```

The NextAuth adapter will automatically create these collections:
- `users` - User profiles
- `accounts` - OAuth accounts (if using social login)
- `sessions` - Active sessions
- `verification_tokens` - Magic link tokens

### 5. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy the output and set as `NEXTAUTH_SECRET` in `.env.local`

### 6. Test the Application

```bash
npm run dev
```

Visit `http://localhost:3001/login` and try:

**Email Magic Link:**
1. Click "Email" tab
2. Enter your email
3. Click "Send Magic Link"
4. Check your email inbox
5. Click the link
6. You're logged in!

**SMS OTP:**
1. Click "SMS" tab
2. Enter phone number (E.164 format: +12345678900)
3. Click "Send Verification Code"
4. Enter the 6-digit code from SMS
5. Click "Verify & Sign In"
6. You're logged in!

## Features

### Automatic Account Creation
- No separate registration needed
- First-time users are auto-created on successful authentication
- Email users → created with email
- SMS users → created with phone number (email is placeholder)

### Security Features
- ✅ One-time use tokens (magic links expire)
- ✅ Time-limited codes (Twilio OTP expires in 10 minutes)
- ✅ JWT session tokens (HTTP-only cookies)
- ✅ MongoDB adapter for secure token storage
- ✅ No passwords to manage or leak
- ✅ CSRF protection (built into NextAuth)

### User Experience
- Simple, modern UI with DaisyUI
- Toggle between Email and SMS
- Clear success/error messages
- Automatic redirect after login
- Responsive design for mobile

## API Endpoints

### NextAuth Endpoints (Auto-generated)
- `GET /api/auth/signin` - Sign in page (redirects to /login)
- `POST /api/auth/signin/email` - Send magic link
- `GET /api/auth/callback/email` - Verify magic link
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get current session

### Custom Endpoints
- `POST /api/auth/sms/send-otp` - Send SMS OTP code
  ```json
  {
    "phoneNumber": "+12345678900"
  }
  ```

## Usage in Code

### Check if User is Logged In (Client Component)

```typescript
'use client';

import { useSession } from 'next-auth/react';

export default function MyComponent() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {session.user.name}!</div>;
}
```

### Check Auth on Server

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  return Response.json({ user: session.user });
}
```

### Sign Out

```typescript
import { signOut } from 'next-auth/react';

<button onClick={() => signOut({ callbackUrl: '/login' })}>
  Sign Out
</button>
```

## Troubleshooting

### Magic Link Issues

**Problem:** Email not received
- Check spam folder
- Verify `EMAIL_SERVER_*` credentials
- Test SMTP connection
- Check email service logs

**Problem:** Link expired
- Magic links expire after 24 hours
- Request a new link

**Problem:** "Configuration error"
- Verify `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your domain
- Check MongoDB connection

### SMS OTP Issues

**Problem:** Code not received
- Verify phone number is in E.164 format (+12345678900)
- Check Twilio balance
- Verify Twilio credentials
- Check Twilio service is active

**Problem:** "Invalid code"
- Codes expire after 10 minutes
- Request a new code
- Ensure you're entering all 6 digits

**Problem:** Twilio errors
- Check Account SID and Auth Token
- Verify Service SID is correct
- Ensure phone number is verified (trial accounts)

### Database Issues

**Problem:** Cannot connect to MongoDB
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` is correct
- Verify network connectivity
- Check firewall settings

**Problem:** User not created
- Check database permissions
- Verify User model schema
- Check server logs for errors

## Production Checklist

- [ ] Use MongoDB Atlas or managed MongoDB
- [ ] Use Resend or professional email service
- [ ] Upgrade Twilio account (remove trial limitations)
- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Use HTTPS (`NEXTAUTH_URL=https://...`)
- [ ] Configure proper email domain (SPF, DKIM, DMARC)
- [ ] Set up monitoring for auth failures
- [ ] Implement rate limiting on `/api/auth/sms/send-otp`
- [ ] Add analytics/tracking for auth events
- [ ] Test magic link and SMS from production domain
- [ ] Configure session duration appropriately
- [ ] Set up backup/disaster recovery for MongoDB

## Cost Estimates

### Email (Resend)
- **Free Tier:** 3,000 emails/month
- **Paid:** $20/month for 50,000 emails
- **Cost per login:** ~$0.0004

### SMS (Twilio)
- **Trial:** $15 credit
- **SMS Cost:** ~$0.0075 per message
- **Verify Service:** Free (pay per verification)
- **Cost per login:** ~$0.0075

### MongoDB (Atlas)
- **Free Tier:** 512MB storage
- **Shared:** $9/month for 2GB
- **Dedicated:** Starts at $57/month

**Estimated Monthly Cost for 1,000 logins:**
- 500 email + 500 SMS = $0.20 + $3.75 = **~$4/month**
- Plus MongoDB (free tier sufficient for small apps)

## Support

For issues with the authentication system:
1. Check this documentation
2. Review `.env.local` configuration
3. Check server logs: `npm run dev`
4. Test with cURL or Postman
5. Verify third-party service status (Twilio, Resend)

For service-specific help:
- **NextAuth:** https://next-auth.js.org/
- **Twilio:** https://www.twilio.com/docs/verify
- **Resend:** https://resend.com/docs
