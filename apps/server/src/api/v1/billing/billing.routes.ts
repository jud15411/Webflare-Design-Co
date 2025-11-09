import { Router } from 'express';
import {
  getBillingSettings,
  updateBillingSettings,
} from './billing.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { UserRole } from '../settings/users/users.model.js';

const router = Router();

// Protect all billing routes for CEOs only
router.use(protect, authorizeRoles(UserRole.CEO));

router.route('/').get(getBillingSettings).put(updateBillingSettings);

export default router;
