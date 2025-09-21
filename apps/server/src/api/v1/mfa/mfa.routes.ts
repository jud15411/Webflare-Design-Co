import { Router } from 'express';
import { getMfaSettings, updateMfaSettings } from './mfa.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { UserRole } from '../auth/user.model.js';

const router = Router();

// Protect all MFA routes for CEOs only
router.use(protect, authorizeRoles(UserRole.CEO));

router.route('/').get(getMfaSettings).put(updateMfaSettings);

export default router;
