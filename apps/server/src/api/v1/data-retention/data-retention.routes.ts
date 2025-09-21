import { Router } from 'express';
import { getPolicy, updatePolicy } from './data-retention.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { UserRole } from '../auth/user.model.js';

const router = Router();

// Protect all data retention routes for CEOs only
router.use(protect, authorizeRoles(UserRole.CEO));

router.route('/').get(getPolicy).put(updatePolicy);

export default router;
