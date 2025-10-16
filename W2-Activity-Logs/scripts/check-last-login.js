/**
 * Script to check lastLogin updates in FSC users collection
 * Run with: node scripts/check-last-login.js [email]
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Read from .env file manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const AUTH_MONGODB_URI = envVars.AUTH_MONGODB_URI;
const AUTH_MONGODB_DB = envVars.AUTH_MONGODB_DB || 'FSC';

async function checkLastLogin() {
  try {
    const emailToCheck = process.argv[2] || 'uxmccauley@gmail.com';

    console.log('Connecting to FSC database...');
    const connection = await mongoose.createConnection(AUTH_MONGODB_URI, {
      dbName: AUTH_MONGODB_DB,
    }).asPromise();

    console.log('✅ Connected successfully!\n');

    const usersCollection = connection.db.collection('users');

    // Find user by email
    const user = await usersCollection.findOne({ email: emailToCheck });

    if (!user) {
      console.log(`❌ User not found: ${emailToCheck}`);
      await connection.close();
      return;
    }

    console.log('📊 User Login Information:');
    console.log('─'.repeat(50));
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Phone: ${user.phone || 'N/A'}`);
    console.log(`Level: ${user.level || 'N/A'}`);
    console.log(`Programs: ${user.programs?.join(', ') || 'N/A'}`);
    console.log('─'.repeat(50));

    if (user.lastLogin) {
      const lastLoginDate = new Date(user.lastLogin);
      const now = new Date();
      const diffMs = now - lastLoginDate;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      console.log(`\n✅ Last Login: ${lastLoginDate.toLocaleString()}`);

      if (diffMins < 1) {
        console.log(`⏱️  Time since: Just now (${Math.floor(diffMs / 1000)} seconds ago)`);
      } else if (diffMins < 60) {
        console.log(`⏱️  Time since: ${diffMins} minute${diffMins > 1 ? 's' : ''} ago`);
      } else if (diffHours < 24) {
        console.log(`⏱️  Time since: ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`);
      } else {
        console.log(`⏱️  Time since: ${diffDays} day${diffDays > 1 ? 's' : ''} ago`);
      }
    } else {
      console.log('\n⚠️  Last Login: Never (field not set)');
    }

    if (user.emailVerified) {
      console.log(`\n✅ Email Verified: ${new Date(user.emailVerified).toLocaleString()}`);
    }

    if (user.timestamp) {
      console.log(`📅 Account Created: ${new Date(user.timestamp).toLocaleString()}`);
    }

    // Watch for changes (optional)
    console.log('\n👁️  Watching for updates... (Press Ctrl+C to stop)');
    console.log('(Try logging in with this email to see lastLogin update)\n');

    let lastCheckTime = user.lastLogin;
    setInterval(async () => {
      const updatedUser = await usersCollection.findOne({ email: emailToCheck });
      if (updatedUser?.lastLogin && updatedUser.lastLogin !== lastCheckTime) {
        console.log(`\n🔄 LASTLOGIN UPDATED!`);
        console.log(`   Old: ${lastCheckTime ? new Date(lastCheckTime).toLocaleString() : 'Never'}`);
        console.log(`   New: ${new Date(updatedUser.lastLogin).toLocaleString()}`);
        console.log(`   ✅ Authentication is working against FSC database!\n`);
        lastCheckTime = updatedUser.lastLogin;
      }
    }, 2000); // Check every 2 seconds

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkLastLogin();
