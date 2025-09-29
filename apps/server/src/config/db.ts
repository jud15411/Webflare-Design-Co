import mongoose from 'mongoose';

let mainDb: mongoose.Connection;
let publicDb: mongoose.Connection;

// This function ESTABLISHES the main DB connection
export const connectMainDB = async () => {
  try {
    mainDb = await mongoose.createConnection(process.env.MONGO_URI!).asPromise();
    console.log(`Main MongoDB Connected: ${mainDb.host}`);
  } catch (error: any) {
    console.error(`Main DB Error: ${error.message}`);
    process.exit(1);
  }
};

// This function ESTABLISHES the public DB connection
export const connectPublicDB = async () => {
  try {
    publicDb = await mongoose.createConnection(process.env.MONGO_URI_PUBLIC!).asPromise();
    console.log(`Public Website MongoDB Connected: ${publicDb.host}`);
  } catch (error: any) {
    console.error(`Public DB Error: ${error.message}`);
    process.exit(1);
  }
};

// --- THE FIX ---
// These functions SAFELY RETRIEVE the established connection.
// Your models will use these "getter" functions.
export const getMainDb = () => {
  if (!mainDb) {
    throw new Error('Main DB has not been connected yet. Make sure connectMainDB() is called at server startup.');
  }
  return mainDb;
};

export const getPublicDb = () => {
  if (!publicDb) {
    throw new Error('Public DB has not been connected yet. Make sure connectPublicDB() is called at server startup.');
  }
  return publicDb;
};