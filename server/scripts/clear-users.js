// Script to clear all non-admin users from the database
// WARNING: This will delete all regular users!
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env file');
  process.exit(1);
}

const clearUsers = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Delete all non-admin users
    const result = await User.deleteMany({ role: { $ne: 'admin' } });
    
    console.log(`✅ Deleted ${result.deletedCount} regular user(s)`);
    console.log('ℹ️ Admin users were preserved\n');

    // List remaining users
    const remainingUsers = await User.find({}).select('email name role');
    console.log(`Remaining users (${remainingUsers.length}):`);
    remainingUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.role})`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Ask for confirmation
console.log('⚠️  WARNING: This will delete ALL regular users!');
console.log('Admin users will be preserved.\n');
console.log('To proceed, uncomment the line below in the script file:');
console.log('// clearUsers();\n');

// Uncomment the line below to actually run the deletion
// clearUsers();
