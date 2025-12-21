const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');

router.post(
  '/login',
  [body('userName').notEmpty().escape(), body('password').notEmpty()],
  authController.login
);

router.post('/logout', authController.logout);

module.exports = router;
