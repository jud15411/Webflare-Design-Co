const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // We removed the deprecated flags to resolve your previous warning
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('Could not connect to MongoDB:', err.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
