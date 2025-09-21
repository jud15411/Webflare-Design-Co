import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../src/config/db.js';
import { User } from '../src/api/v1/auth/user.model.js';

// Load correct environment variables
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const createUser = async () => {
  await connectDB();

  try {
    // --- DEFINE YOUR DEV USER HERE ---
    const devUser = {
      name: 'Dev Admin',
      email: 'dev@admin.com',
      password: 'password123',
    };
    // ---------------------------------

    // Delete the user if they already exist
    await User.deleteOne({ email: devUser.email });

    // Create the new user (Mongoose pre-save hook will hash the password)
    await User.create(devUser);

    console.log('✅ Development user created successfully!');
  } catch (error) {
    console.error('Error creating development user:', error);
  } finally {
    // Ensure the database connection is closed
    await mongoose.connection.close();
  }
};

createUser();
