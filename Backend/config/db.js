const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing. Add it to Backend/.env before starting the server.');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      family: 4,
    });
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    const isAtlasNetworkError = error.message.includes('whitelist')
      || error.message.includes('IP')
      || error.message.includes('ECONNREFUSED')
      || error.message.includes('Server selection timed out');

    console.error("MongoDB connection failed:", error.message);
    if (isAtlasNetworkError) {
      console.error('Atlas fix: add this machine public IP to Network Access > IP Access List, then restart the backend.');
    }
    throw error;
  }
};

module.exports = connectDB;
