/**
 * Script to create a test user in the auth database
 * Run with: node scripts/create-test-user.js
 */

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Configuration - update these values
const AUTH_MONGODB_URI = process.env.AUTH_MONGODB_URI || 'mongodb://localhost:27017/auth-system';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';

// AuthUser Schema
const authUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  localUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
}, {
  timestamps: true,
});

async function createTestUser() {
  try {
    console.log('Connecting to auth database...');
    await mongoose.connect(AUTH_MONGODB_URI, {
      dbName: 'auth-system',
    });

    console.log('Connected successfully!');

    const AuthUser = mongoose.model('AuthUser', authUserSchema);

    // Check if user already exists
    const existingUser = await AuthUser.findOne({ email: TEST_EMAIL });
    if (existingUser) {
      console.log(`User ${TEST_EMAIL} already exists!`);
      console.log('User ID:', existingUser._id);
      await mongoose.connection.close();
      return;
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);

    // Create user
    console.log('Creating test user...');
    const newUser = await AuthUser.create({
      email: TEST_EMAIL,
      password: hashedPassword,
      isActive: true,
    });

    console.log('✅ Test user created successfully!');
    console.log('-----------------------------------');
    console.log('Email:', TEST_EMAIL);
    console.log('Password:', TEST_PASSWORD);
    console.log('User ID:', newUser._id);
    console.log('-----------------------------------');
    console.log('You can now log in at http://localhost:3001/login');

    await mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();
