const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_library';

  try {
    mongoose.set('strictQuery', false);
    console.log('Attempting connection to MongoDB at:', uri);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1500,
    });
    console.log(`✅ MongoDB Connected to external database: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    console.log('⚠️ External MongoDB connection failed. Launching built-in In-Memory MongoDB...');
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();
      await mongoose.connect(memUri);
      console.log(`🚀 In-Memory MongoDB Connected at: ${memUri}`);
      return true;
    } catch (memErr) {
      console.error(`❌ In-Memory MongoDB Error: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
