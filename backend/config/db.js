const mongoose = require('mongoose');

// Disable command buffering so Mongoose calls fail fast or fallback instantly when DB is offline
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/coworkspace_db';
  console.log(`📡 Connecting to MongoDB at ${connStr}...`);

  try {
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ Primary MongoDB Connection Notice: ${error.message}`);
    console.warn('ℹ️ Express Backend running in Standalone API Mode with in-memory Mongo model fallback.');
  }
};

module.exports = connectDB;
