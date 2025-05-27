require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdminUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/webflare-admin', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Check if admin already exists
        const existingAdmin = await User.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Create admin user
        const admin = new User({
            username: 'admin',
            password: 'admin123', // This will be hashed automatically
            name: 'Administrator',
            role: 'admin'
        });

        await admin.save();
        console.log('Admin user created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

createAdminUser(); 