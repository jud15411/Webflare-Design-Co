// db.ts

import mongoose from 'mongoose';

let mainDb: mongoose.Connection;
let publicDb: mongoose.Connection;

// Check the environment once for use in connection functions
const isDevelopment = process.env.NODE_ENV === 'development';

// This function ESTABLISHES the main DB connection
export const connectMainDB = async () => {
  try {
    // Dynamically select the URI based on environment
    const uri = isDevelopment ? process.env.DEV_MONGO_URI : process.env.MONGO_URI;
    if (!uri) throw new Error('Main DB URI is not defined for the current environment.');

    mainDb = await mongoose.createConnection(uri).asPromise();
    console.log(`Main MongoDB Connected: ${mainDb.host} (${isDevelopment ? 'Development' : 'Production'})`);
  } catch (error: any) {
    console.error(`Main DB Error: ${error.message}`);
    process.exit(1);
  }
};

// This function ESTABLISHES the public DB connection
export const connectPublicDB = async () => {
  try {
    // Dynamically select the URI based on environment
    const uri = isDevelopment ? process.env.DEV_MONGO_URI_PUBLIC : process.env.MONGO_URI_PUBLIC;
    if (!uri) throw new Error('Public DB URI is not defined for the current environment.');

    publicDb = await mongoose.createConnection(uri).asPromise();
    console.log(`Public Website MongoDB Connected: ${publicDb.host} (${isDevelopment ? 'Development' : 'Production'})`);
  } catch (error: any) {
    console.error(`Public DB Error: ${error.message}`);
    process.exit(1);
  }
};

// These functions SAFELY RETRIEVE the established connection.
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