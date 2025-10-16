# Vercel Deployment Guide

## Environment Variables Required

To fix the login redirect loop, you **MUST** set these environment variables in your Vercel project settings:

### 1. Go to Vercel Dashboard
- Navigate to: https://vercel.com/dashboard
- Select your project: `w2-fset-activity-logs`
- Go to: **Settings → Environment Variables**

### 2. Add Required Environment Variables

#### NextAuth Configuration (CRITICAL)
```bash
# IMPORTANT: Set this to your actual Vercel deployment URL
NEXTAUTH_URL=https://w2-fset-activity-logs-8cim.vercel.app

# Generate a secure secret with: openssl rand -base64 32
NEXTAUTH_SECRET=your-generated-secret-here
```

#### MongoDB Connection
```bash
# Your MongoDB connection string (Atlas or other cloud MongoDB)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
MONGODB_DB=your-database-name
```

#### Email Provider (Choose One)

**Option A: SMTP (Gmail, Outlook, etc.)**
```bash
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourapp.com
```

**Option B: Resend (Recommended for Production)**
```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=onboarding@yourdomain.com
```

#### SMS Provider - Twilio
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Common Issues & Solutions

### Issue: Redirect Loop After Login
**Symptom:** After login, redirects to `/login?callbackUrl=/dashboard` continuously

**Solutions:**
1. ✅ Ensure `NEXTAUTH_URL` is set to your production URL (e.g., `https://w2-fset-activity-logs-8cim.vercel.app`)
2. ✅ Ensure `NEXTAUTH_SECRET` is set and is at least 32 characters
3. ✅ Make sure MongoDB connection is working (check Vercel logs)
4. ✅ Redeploy after setting environment variables

### Issue: Email Magic Links Not Working
**Solutions:**
1. Check that `EMAIL_SERVER_*` variables are set correctly
2. For Gmail, use an "App Password" not your regular password
3. Check Vercel function logs for email errors

### Issue: SMS Authentication Not Working
**Solutions:**
1. Verify all three Twilio variables are set
2. Ensure phone numbers are in E.164 format (+1234567890)
3. Check Twilio console for verification service status

## How to Generate NEXTAUTH_SECRET

Run this command in your terminal:
```bash
openssl rand -base64 32
```

Copy the output and paste it as the value for `NEXTAUTH_SECRET` in Vercel.

## After Setting Environment Variables

1. Go to your Vercel project
2. Click **Deployments** tab
3. Click the three dots (**···**) on the latest deployment
4. Click **Redeploy**
5. ✅ Select "Use existing Build Cache" (faster)
6. Click **Redeploy**

## Verify Deployment

After redeploying:
1. Visit your app: https://w2-fset-activity-logs-8cim.vercel.app
2. Click "Login"
3. Try logging in with email or SMS
4. Should redirect to `/dashboard` after successful authentication

## Debugging

If issues persist, check Vercel function logs:
1. Go to Vercel Dashboard → Your Project
2. Click on **Logs** tab
3. Look for errors related to:
   - Database connection errors
   - NextAuth errors
   - Email/SMS provider errors

## Support

If you continue to experience issues:
1. Check that all environment variables are set in **Production** environment
2. Ensure MongoDB allows connections from Vercel's IP addresses (0.0.0.0/0 for testing)
3. Verify email/SMS provider credentials are valid
