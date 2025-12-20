const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const logger = require('../utils/logger'); // Import the logger utility
const router = express.Router();
const Role = require('../models/Role');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many login attempts. Please try again later.' },
});

const validateLogin = [
  body('userName').isString().trim().escape().notEmpty(),
  body('password').isString().notEmpty(),
];

router.post('/login', loginLimiter, validateLogin, async (req, res) => {
  const { userName, password } = req.body;
  const rawIp =
    req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress; // Capture requester IP for security

  const userIp = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : rawIp;

  try {
    // 1. Attempt to find the user
    const user = await User.findOne({ userName }).populate('role');

    if (!user) {
      // LOG: Failed login due to non-existent user
      logger.warn('Login attempt failed: User not found', {
        userName,
        ip,
        event: 'AUTH_FAILURE_USER_MISSING',
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. Check Password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      // LOG: Failed login due to incorrect password
      logger.warn('Login attempt failed: Invalid password', {
        userName,
        ip,
        userId: user._id,
        event: 'AUTH_FAILURE_WRONG_PASSWORD',
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. LOG: Successful Login
    logger.info('User login successful', {
      userId: user._id,
      userName: user.userName,
      branch: user.branch,
      role: user.role.name,
      ip: userIp,
      event: 'AUTH_SUCCESS',
    });

    // --- JWT & Cookie Generation ---
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role.name,
        branch: user.branch,
        permissions: user.role.permissions,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    const csrfToken = crypto.randomBytes(64).toString('hex');

    const cookieOptions = {
      // Use a leading dot to allow the cookie on all subdomains (portal and webflare)
      domain: '.networkguru.com',
      secure: false,
      sameSite: 'lax', // 'lax' is required for cross-subdomain requests
      maxAge: 8 * 60 * 60 * 1000,
    };

    res.cookie('token', token, {
      ...cookieOptions,
      httpOnly: true, // Keep this true for security
    });

    res.cookie('XSRF-TOKEN', csrfToken, {
      ...cookieOptions,
      httpOnly: false, // Set to false so your frontend can read it to send headers
    });

    res.json({
      user: {
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
        branch: user.branch,
        permissions: user.role.permissions,
      },
    });
  } catch (err) {
    // LOG: Critical system error
    logger.error('Critical Auth System Error', {
      error: err.message,
      stack: err.stack,
      event: 'SYSTEM_ERROR',
    });
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  // 1. Get the identifier
  const identifier = req.body?.userName || 'Active Session';

  // 2. Capture the IP correctly (Respecting the proxy)
  const rawIp =
    req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;

  const userIp = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : rawIp;

  // 3. Log with IP metadata
  logger.info('User logout successful', {
    userName: identifier,
    ip: userIp, // Added IP field
    event: 'AUTH_LOGOUT',
  });

  const clearOptions = {
    domain:
      process.env.NODE_ENV === 'production' ? '.networkguru.com' : 'localhost',
    sameSite: 'lax',
  };

  res.clearCookie('token', clearOptions);
  res.clearCookie('XSRF-TOKEN', clearOptions);
  return res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
