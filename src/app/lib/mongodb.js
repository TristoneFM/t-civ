import mongoose from 'mongoose';

const MONGO_SERVER = process.env.MONGO_SERVER;
const MONGO_DB = process.env.MONGO_DB;
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;

if (!MONGO_SERVER || !MONGO_DB || !MONGO_USER || !MONGO_PASSWORD) {
  throw new Error('Please define all MongoDB environment variables (MONGO_SERVER, MONGO_DB, MONGO_USER, MONGO_PASSWORD) inside .env');
}

// Construct MongoDB URI
const MONGODB_URI = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_SERVER}/${MONGO_DB}`;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      readPreference: 'secondaryPreferred', // Optimize for read operations
      maxPoolSize: 10, // Limit connection pool size
      minPoolSize: 5,  // Maintain minimum connections
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB; 