const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const { authorizeBranch } = require('../middleware/auth');

// 1. Registry - Requires 'global_view_client_registry'
router.get(
  '/registry',
  protect,
  authorize('global_view_client_registry'),
  clientController.getClientRegistry
);

// 2. Creation - Admin Branch + 'sys_manage_clients'
router.post(
  '/',
  protect,
  authorizeBranch(['admin']),
  authorize('sys_manage_clients'),
  clientController.createClient
);

// 3. Update - Requires any of the Management permissions
router.patch(
  '/:id',
  protect,
  authorize(
    'SYS_MANAGE_CLIENTS',
    'WEB_MANAGE_CLIENTS',
    'CYBER_MANAGE_CLIENTS',
    'SUPER_ADMIN'
  ),
  clientController.updateClient
);

router.get('/:id', protect, clientController.getClient);

module.exports = router;
