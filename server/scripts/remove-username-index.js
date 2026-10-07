// Script to remove the problematic username index
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env file');
  process.exit(1);
}

const removeUsernameIndex = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const collection = mongoose.connection.collection('users');
    
    // List all indexes
    console.log('📋 Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, index.key);
    });
    
    // Remove username index
    try {
      await collection.dropIndex('username_1');
      console.log('\n✅ Successfully removed username_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('\nℹ️  username_1 index does not exist');
      } else {
        console.log('\n⚠️  Error removing index:', error.message);
      }
    }

    // List indexes after removal
    console.log('\n📋 Indexes after removal:');
    const indexesAfter = await collection.indexes();
    indexesAfter.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, index.key);
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    console.log('\n✅ You can now try signing up again!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

removeUsernameIndex();
