/**
 * Script to inspect the FSC database 'users' collection
 * Run with: node scripts/inspect-fsc-users.js
 */

const mongoose = require('mongoose');

// Read from .env file manually
const fs = require('fs');
const path = require('path');
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

async function inspectUsers() {
  try {
    console.log('Connecting to FSC database...');
    console.log('URI:', AUTH_MONGODB_URI);
    console.log('DB:', AUTH_MONGODB_DB);

    const connection = await mongoose.createConnection(AUTH_MONGODB_URI, {
      dbName: AUTH_MONGODB_DB,
    }).asPromise();

    console.log('✅ Connected successfully!\n');

    // Get collection names
    const collections = await connection.db.listCollections().toArray();
    console.log('Available collections:');
    collections.forEach(col => console.log(`  - ${col.name}`));
    console.log('');

    // Check if 'users' collection exists
    const usersCollection = connection.db.collection('users');
    const userCount = await usersCollection.countDocuments();

    console.log(`\n📊 Users Collection Stats:`);
    console.log(`   Total users: ${userCount}`);

    if (userCount > 0) {
      // Get sample user (without sensitive data)
      const sampleUser = await usersCollection.findOne({});
      console.log('\n📄 Sample User Structure:');
      console.log(JSON.stringify(sampleUser, null, 2));

      // Get field names from sample
      console.log('\n🔑 Available Fields:');
      Object.keys(sampleUser).forEach(key => {
        console.log(`   - ${key}: ${typeof sampleUser[key]}`);
      });

      // Get some stats
      const emailCount = await usersCollection.countDocuments({ email: { $exists: true } });
      const phoneCount = await usersCollection.countDocuments({ phoneNumber: { $exists: true } });
      const roleStats = await usersCollection.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]).toArray();

      console.log('\n📈 Field Statistics:');
      console.log(`   Users with email: ${emailCount}`);
      console.log(`   Users with phoneNumber: ${phoneCount}`);
      console.log('   Role distribution:');
      roleStats.forEach(stat => {
        console.log(`     - ${stat._id}: ${stat.count}`);
      });
    } else {
      console.log('\n⚠️  No users found in collection.');
    }

    await connection.close();
    console.log('\n✅ Inspection complete. Connection closed.');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

inspectUsers();
