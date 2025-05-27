const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    updatePassword,
    getMe
} = require('../controllers/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.use(protect); // All routes after this middleware require authentication
router.get('/me', getMe);
router.post('/logout', logout);
router.patch('/update-password', updatePassword);

module.exports = router; 