const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    res.json({
        id: req.user._id,
        username: req.user.username,
        name: req.user.name,
        role: req.user.role
    });
});

// Create new user (admin only)
router.post('/users', auth, adminOnly, async (req, res) => {
    try {
        const { username, password, name, role } = req.body;
        
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const user = new User({
            username,
            password,
            name,
            role: role || 'staff'
        });

        await user.save();

        res.status(201).json({
            id: user._id,
            username: user.username,
            name: user.name,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all users (admin only)
router.get('/users', auth, adminOnly, async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 