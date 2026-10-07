// Script to find a specific user by email (case-insensitive)
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env file');
  process.exit(1);
}

const findUser = async (emailToFind) => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const normalizedEmail = emailToFind.toLowerCase().trim();
    console.log(`Searching for: "${emailToFind}" (normalized: "${normalizedEmail}")\n`);

    // Try exact match first
    const exactMatch = await User.findOne({ email: normalizedEmail });
    if (exactMatch) {
      console.log('✅ Found exact match:');
      console.log(`   Email: ${exactMatch.email}`);
      console.log(`   Name: ${exactMatch.name}`);
      console.log(`   Role: ${exactMatch.role}`);
      console.log(`   Created: ${exactMatch.createdAt}`);
    } else {
      console.log('❌ No exact match found');
    }

    // Try case-insensitive search
    const caseInsensitiveMatch = await User.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });
    
    if (caseInsensitiveMatch && caseInsensitiveMatch.email !== normalizedEmail) {
      console.log('\n⚠️  Found case-insensitive match (different casing):');
      console.log(`   Email in DB: "${caseInsensitiveMatch.email}"`);
      console.log(`   Searched for: "${normalizedEmail}"`);
      console.log(`   Name: ${caseInsensitiveMatch.name}`);
      console.log(`   Role: ${caseInsensitiveMatch.role}`);
    }

    // List all users for comparison
    const allUsers = await User.find({}).select('email name role');
    console.log(`\n📋 All users in database (${allUsers.length}):`);
    allUsers.forEach((user, index) => {
      const isMatch = user.email.toLowerCase() === normalizedEmail;
      console.log(`${index + 1}. "${user.email}" ${isMatch ? '← MATCH' : ''}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.log('Usage: node scripts/find-user.js <email>');
  console.log('Example: node scripts/find-user.js srougy@gmail.com');
  process.exit(1);
}

findUser(email);
