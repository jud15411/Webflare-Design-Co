const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeBranch } = require('../middleware/auth');

router.post(
  '/provision-user',
  protect,
  authorizeBranch(['admin']),
  adminController.provisionUser
);

module.exports = router;
