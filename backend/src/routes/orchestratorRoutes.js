const express = require('express');
const router = express.Router();
const orchestratorController = require('../controllers/orchestratorController');
const { protect } = require('../middleware/authMiddleware');
const verifyCsrf = require('../middleware/csrfProtection');

router.get('/users', protect, verifyCsrf, orchestratorController.getUsers);
router.post('/roles', protect, verifyCsrf, orchestratorController.createRole);

router.get('/roles', protect, verifyCsrf, orchestratorController.getRoles);
router.get(
  '/permissions/list',
  protect,
  verifyCsrf,
  orchestratorController.getPermissionManifest
);

router.patch(
  '/roles/:id',
  protect,
  verifyCsrf,
  orchestratorController.updateRole
);

module.exports = router;
