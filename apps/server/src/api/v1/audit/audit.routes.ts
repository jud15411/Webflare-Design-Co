import { Router } from 'express';
import { getAuditLogs } from './audit.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { UserRole } from '../settings/users/users.model.js';

const router = Router();

// Protect all audit log routes for CEOs only
router.use(protect, authorizeRoles(UserRole.CEO));

router.route('/').get(getAuditLogs);

export default router;
