import { Router } from 'express';
import {
  getCompanyInfo,
  updateCompanyInfo,
  manageServices,
  updateUserRole,
} from './settings.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { UserRole } from '../auth/user.model.js'; // <-- Import the UserRole enum

const router = Router();

// Protect all settings routes
router.use(protect);

// Routes for CEO-level settings
router
  .route('/company-info')
  .get(authorizeRoles(UserRole.CEO), getCompanyInfo) // <-- Use UserRole.CEO
  .put(authorizeRoles(UserRole.CEO), updateCompanyInfo); // <-- Use UserRole.CEO

router.route('/services').put(authorizeRoles(UserRole.CEO), manageServices); // <-- Use UserRole.CEO

router.route('/user-role').put(authorizeRoles(UserRole.CEO), updateUserRole); // <-- Use UserRole.CEO

// Other CEO settings endpoints will be added here

export default router;
