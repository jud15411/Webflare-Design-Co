const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');

// Restore the Login Limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many login attempts. Please try again later.' },
});

// Restore exact validation logic
const validateLogin = [
  body('userName').isString().trim().escape().notEmpty(),
  body('password').isString().notEmpty(),
];

router.post('/login', loginLimiter, validateLogin, authController.login);

router.post('/logout', authController.logout);

module.exports = router;
