import { Router } from 'express';
import {
  getPortalSettings,
  updatePortalSettings,
} from './client-portal.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { UserRole } from '../settings/users/users.model.js';

const router = Router();

// Protect all client portal routes for CEOs only
router.use(protect, authorizeRoles(UserRole.CEO));

router.route('/').get(getPortalSettings).put(updatePortalSettings);

export default router;
