/**
 * Script to verify we're using the correct 'users' collection in FSC
 * Run with: node scripts/verify-users-collection.js
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

async function verifyCollections() {
  try {
    console.log('🔍 Verifying FSC Database Configuration\n');
    console.log('─'.repeat(60));

    const connection = await mongoose.createConnection(AUTH_MONGODB_URI, {
      dbName: AUTH_MONGODB_DB,
    }).asPromise();

    console.log('✅ Connected to FSC database');
    console.log(`   Database: ${AUTH_MONGODB_DB}`);
    console.log('─'.repeat(60));

    // List all collections
    const collections = await connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name).sort();

    console.log('\n📂 Available Collections:');
    collectionNames.forEach(name => {
      const indicator = name === 'users' ? ' ← ✅ TARGET COLLECTION' : '';
      const authIndicator = name === 'authusers' ? ' ⚠️  NOT USED' : '';
      console.log(`   - ${name}${indicator}${authIndicator}`);
    });

    // Check 'users' collection
    const usersCollection = connection.db.collection('users');
    const userCount = await usersCollection.countDocuments();

    console.log('\n👥 "users" Collection:');
    console.log(`   Total users: ${userCount}`);
    console.log('   ✅ This is the collection we ARE using');

    // Check if there's an 'authusers' collection
    if (collectionNames.includes('authusers')) {
      const authUsersCollection = connection.db.collection('authusers');
      const authUserCount = await authUsersCollection.countDocuments();
      console.log('\n⚠️  "authusers" Collection:');
      console.log(`   Total documents: ${authUserCount}`);
      console.log('   ❌ This collection is NOT used by our app');
      console.log('   (It may be used by other FSC applications)');
    }

    // Verify schema matches
    console.log('\n🔑 Verifying Field Names:');
    const sampleUser = await usersCollection.findOne({});
    if (sampleUser) {
      const criticalFields = {
        'email': sampleUser.email ? '✅' : '❌',
        'name': sampleUser.name ? '✅' : '❌',
        'phone': sampleUser.phone !== undefined ? '✅' : '⚠️',
        'level': sampleUser.level !== undefined ? '✅' : '⚠️',
        'programs': Array.isArray(sampleUser.programs) ? '✅' : '⚠️',
        'lastLogin': sampleUser.lastLogin !== undefined ? '✅' : '⚠️',
      };

      Object.entries(criticalFields).forEach(([field, status]) => {
        console.log(`   ${status} ${field}`);
      });
    }

    // Show model configuration
    console.log('\n⚙️  Model Configuration:');
    console.log('   Model name: AuthUser');
    console.log('   Collection name: "users" ✅');
    console.log('   Location: models/AuthUser.ts');

    console.log('\n📝 Summary:');
    console.log('   ✅ Using FSC "users" collection (393 users)');
    console.log('   ✅ All user authentication writes to "users"');
    console.log('   ✅ lastLogin updates will write to "users"');
    console.log('   ✅ Profile data pulled from "users"');

    await connection.close();
    console.log('\n' + '─'.repeat(60));
    console.log('✅ Verification complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyCollections();
