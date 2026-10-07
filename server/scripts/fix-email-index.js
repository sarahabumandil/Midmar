// Script to fix email index and normalize existing emails
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env file');
  process.exit(1);
}

const fixEmailIndex = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get the collection
    const collection = mongoose.connection.collection('users');
    
    // Drop existing unique index on email
    try {
      await collection.dropIndex('email_1');
      console.log('✅ Dropped existing email index');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Index does not exist, creating new one');
      } else {
        console.log('ℹ️  Could not drop index:', error.message);
      }
    }

    // Normalize all existing emails
    console.log('\n📝 Normalizing existing emails...');
    const users = await User.find({});
    let normalized = 0;
    let duplicates = [];

    for (const user of users) {
      const normalizedEmail = user.email.toLowerCase().trim();
      if (user.email !== normalizedEmail) {
        // Check if normalized version already exists
        const existing = await User.findOne({ 
          email: normalizedEmail,
          _id: { $ne: user._id }
        });
        
        if (existing) {
          duplicates.push({
            old: user.email,
            normalized: normalizedEmail,
            existing: existing.email
          });
          console.log(`⚠️  Duplicate found: "${user.email}" → "${normalizedEmail}" (already exists as "${existing.email}")`);
        } else {
          user.email = normalizedEmail;
          await user.save();
          normalized++;
          console.log(`✅ Normalized: "${user.email}"`);
        }
      }
    }

    console.log(`\n✅ Normalized ${normalized} email(s)`);
    if (duplicates.length > 0) {
      console.log(`\n⚠️  Found ${duplicates.length} duplicate(s) that need manual resolution:`);
      duplicates.forEach((dup, i) => {
        console.log(`${i + 1}. "${dup.old}" conflicts with "${dup.existing}"`);
      });
    }

    // Create new unique index (case-insensitive would require a different approach)
    // For now, we'll rely on Mongoose's lowercase transform
    try {
      await collection.createIndex({ email: 1 }, { unique: true });
      console.log('\n✅ Created new unique index on email');
    } catch (error) {
      console.log('ℹ️  Index creation:', error.message);
    }

    // List all users
    const allUsers = await User.find({}).select('email name role');
    console.log(`\n📋 All users (${allUsers.length}):`);
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. "${user.email}" (${user.role})`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

fixEmailIndex();
