# Testing FSC Database Authentication

## Quick Test Guide

Follow these steps to verify that authentication is working against the FSC database and updating lastLogin.

### Step 1: Check Current lastLogin Status

Run the monitoring script:

```bash
node scripts/check-last-login.js uxmccauley@gmail.com
```

This will show:
- Current lastLogin timestamp
- Time since last login
- Real-time monitoring for updates

**Leave this terminal window open** - it will watch for changes!

### Step 2: Open a Second Terminal - Watch Server Logs

The dev server is already running. Watch for these log messages:

```
[AUTH] ✅ Email Login - Updated lastLogin for [email] in FSC database at [timestamp]
```

or for SMS:

```
[AUTH] ✅ SMS Login - Updated lastLogin for [email] in FSC database at [timestamp]
```

### Step 3: Test Authentication

Open your browser and go to:
```
http://localhost:3001/login
```

#### Test Email Magic Link:

1. Enter an existing FSC email (e.g., `uxmccauley@gmail.com`)
2. Click "Send Magic Link"
3. Check your email for the magic link
4. Click the link

**Watch for:**
- ✅ Server log: `[AUTH] ✅ Email Login - Updated lastLogin...`
- ✅ Monitoring script: `🔄 LASTLOGIN UPDATED!`
- ✅ Browser: Redirects to dashboard

#### Test SMS OTP (if configured):

1. Click "SMS" tab
2. Enter phone number in E.164 format (e.g., `+16083998607`)
3. Click "Send Verification Code"
4. Enter the 6-digit code from SMS
5. Click "Verify & Sign In"

**Watch for:**
- ✅ Server log: `[AUTH] ✅ SMS Login - Updated lastLogin...`
- ✅ Monitoring script: `🔄 LASTLOGIN UPDATED!`
- ✅ Browser: Redirects to dashboard

### Step 4: Verify in Database

After successful login, check the FSC database directly:

```bash
# Run the inspection script
node scripts/inspect-fsc-users.js

# Or check specific user
node scripts/check-last-login.js your-email@example.com
```

## Expected Results

### ✅ Success Indicators

1. **Server Logs Show**:
   ```
   [AUTH] ✅ Email Login - Updated lastLogin for uxmccauley@gmail.com in FSC database at 2025-10-16T17:30:00.000Z
   ```

2. **Monitor Script Shows**:
   ```
   🔄 LASTLOGIN UPDATED!
      Old: 2025-10-07T15:33:11.864Z
      New: 2025-10-16T17:30:00.000Z
      ✅ Authentication is working against FSC database!
   ```

3. **Browser Shows**:
   - Dashboard loads with user name
   - Session is active
   - Can access protected routes

4. **FSC Database Shows**:
   - User's lastLogin field updated to current timestamp
   - User data preserved (coach, programs, etc.)

### ❌ Troubleshooting

**No server log message:**
- Check that auth.ts has the console.log statements
- Restart dev server if needed
- Check for errors in server console

**Monitor script doesn't show update:**
- Verify FSC database connection
- Check that AUTH_MONGODB_URI is correct in .env
- Make sure you're checking the right email

**Can't log in:**
- Check email provider settings (EMAIL_SERVER in .env)
- For SMS: Check Twilio credentials
- Check server logs for detailed errors

## Manual Database Check

If you want to manually verify in MongoDB:

```javascript
// Connect to FSC database
use FSC

// Check a specific user's lastLogin
db.users.findOne(
  { email: "uxmccauley@gmail.com" },
  { email: 1, name: 1, lastLogin: 1 }
)

// See all recent logins (last 24 hours)
db.users.find(
  { lastLogin: { $gte: new Date(Date.now() - 24*60*60*1000) } },
  { email: 1, name: 1, lastLogin: 1 }
).sort({ lastLogin: -1 })

// Count users who have logged in today
db.users.countDocuments({
  lastLogin: {
    $gte: new Date(new Date().setHours(0,0,0,0))
  }
})
```

## Test Scenarios

### Scenario 1: Existing FSC User (Email)
- **Setup**: Use existing email like `uxmccauley@gmail.com`
- **Expected**: Should log in, update lastLogin
- **Verifies**: Reading from FSC, updating FSC

### Scenario 2: New User (Email)
- **Setup**: Use a new email not in FSC
- **Expected**: Creates new user in FSC, sets lastLogin
- **Verifies**: Writing to FSC works

### Scenario 3: Existing FSC User (SMS)
- **Setup**: Use phone number of existing FSC user
- **Expected**: Should log in, update lastLogin
- **Verifies**: SMS auth with FSC integration

### Scenario 4: New User (SMS)
- **Setup**: Use a new phone number
- **Expected**: Creates new user in FSC with phone
- **Verifies**: SMS user creation in FSC

## Success Checklist

- [ ] Monitor script shows lastLogin updates in real-time
- [ ] Server logs show `[AUTH] ✅ Email Login - Updated lastLogin...`
- [ ] Dashboard loads with correct user data
- [ ] FSC database lastLogin field is current timestamp
- [ ] Existing user data preserved (coach, programs, etc.)
- [ ] New users created in FSC database, not W2 database
- [ ] Activities reference FSC users._id

## Common Issues

### Issue: lastLogin not updating

**Check:**
1. Is auth.ts actually being called? Add more console.logs
2. Does user.save() succeed? Check for errors
3. Is connection to FSC database working?
4. Are there permission issues on FSC database?

**Solution:**
```javascript
// In auth.ts, add error handling:
try {
  user.lastLogin = loginTime;
  await user.save();
  console.log('[AUTH] ✅ Updated lastLogin successfully');
} catch (error) {
  console.error('[AUTH] ❌ Failed to update lastLogin:', error);
}
```

### Issue: Creating users in wrong database

**Check:**
- Is AUTH_MONGODB_URI pointing to FSC?
- Is AUTH_MONGODB_DB set to "FSC"?
- Is authDbConnect() being used instead of dbConnect()?

### Issue: Field name mismatches

**FSC uses these field names:**
- `phone` (not `phoneNumber`)
- `level` (not `role`)
- `programs` (array, not single `program`)

Make sure code maps correctly!

## Monitoring Commands

**Watch server logs:**
```bash
# The dev server should already be running
# Look for [AUTH] messages in the console
```

**Watch database in real-time:**
```bash
node scripts/check-last-login.js uxmccauley@gmail.com
# Leave this running while you test
```

**Inspect FSC users:**
```bash
node scripts/inspect-fsc-users.js
```

## Next Steps After Verification

Once lastLogin updates are confirmed:

1. ✅ Remove or reduce console.log statements for production
2. ✅ Add analytics/tracking for login events
3. ✅ Set up monitoring alerts for auth failures
4. ✅ Document FSC schema changes if needed
5. ✅ Train team on dual-database architecture

---

**Quick Start**:
```bash
# Terminal 1: Monitor lastLogin updates
node scripts/check-last-login.js uxmccauley@gmail.com

# Terminal 2: Server is already running (watch for [AUTH] logs)

# Browser: Test login at http://localhost:3001/login
```

Good luck! 🚀
