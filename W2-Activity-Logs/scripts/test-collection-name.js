/**
 * Test script to verify the model uses 'users' collection (not 'authusers')
 * Run with: node scripts/test-collection-name.js
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

async function testCollectionName() {
  console.log('🧪 Testing Collection Name Configuration\n');
  console.log('─'.repeat(60));

  try {
    // Connect to database
    console.log('🔌 Connecting to FSC database...');
    const connection = await mongoose.createConnection(AUTH_MONGODB_URI, {
      dbName: AUTH_MONGODB_DB,
    }).asPromise();
    console.log('✅ Connected to FSC');

    // Define the schema with explicit collection name
    const AuthUserSchema = new mongoose.Schema({
      email: String,
      name: String,
      phone: String,
      level: String,
      programs: [String],
      lastLogin: Date,
    }, {
      timestamps: false,
      collection: 'users', // Explicit collection name
    });

    // Create model with explicit collection name (third parameter)
    const modelName = 'User';
    const AuthUser = connection.model(modelName, AuthUserSchema, 'users');

    // Check collection name
    console.log('\n' + '─'.repeat(60));
    console.log('📊 Model Configuration:');
    console.log('─'.repeat(60));
    console.log(`   Model name: ${AuthUser.modelName}`);
    console.log(`   Collection name: ${AuthUser.collection.name}`);
    console.log(`   Database: ${AuthUser.db.name}`);

    if (AuthUser.collection.name === 'users') {
      console.log('\n✅ SUCCESS! Using "users" collection');
      console.log('   ✅ All queries will go to FSC "users"');
      console.log('   ✅ All writes will go to FSC "users"');
      console.log('   ✅ lastLogin will update in FSC "users"');
    } else {
      console.log(`\n❌ ERROR! Using "${AuthUser.collection.name}" collection`);
      console.log('   ❌ Should be using "users" collection');
    }

    // Test a query to verify
    console.log('\n' + '─'.repeat(60));
    console.log('🔍 Testing Query:');
    console.log('─'.repeat(60));
    const count = await AuthUser.countDocuments();
    console.log(`   Found ${count} documents in "${AuthUser.collection.name}" collection`);

    if (count === 393) {
      console.log('   ✅ Correct! This is the FSC users collection');
    }

    // Check what would happen with wrong model name
    console.log('\n' + '─'.repeat(60));
    console.log('⚠️  What happens with model name "AuthUser":');
    console.log('─'.repeat(60));

    const BadModel = connection.model('AuthUser', AuthUserSchema);
    console.log(`   Model name: ${BadModel.modelName}`);
    console.log(`   Collection: ${BadModel.collection.name}`);

    if (BadModel.collection.name === 'authusers') {
      console.log('   ❌ Mongoose pluralized "AuthUser" → "authusers"');
      console.log('   ⚠️  This is why we use model name "User" instead!');
    }

    await connection.close();
    console.log('\n' + '─'.repeat(60));
    console.log('✅ Test complete!\n');
    console.log('📝 Summary:');
    console.log('   • Use model name "User" (not "AuthUser")');
    console.log('   • Always pass third parameter: connection.model(name, schema, "users")');
    console.log('   • This prevents Mongoose from pluralizing to "authusers"');
    console.log('');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testCollectionName();
