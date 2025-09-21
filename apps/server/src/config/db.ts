//
// 🔴 CORRECTED CODE 🔴
//

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI!);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB:`);
    // Throw the error instead of exiting, so the handler in server.ts can catch it.
    throw error;
  }
};

export default connectDB;
