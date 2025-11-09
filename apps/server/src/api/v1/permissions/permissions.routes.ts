import { Router } from 'express';
import { getPermissions, updatePermissions } from './permissions.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { UserRole } from '../settings/users/users.model.js';

const router = Router();

// Protect all permission routes for CEOs only
router.use(protect, authorizeRoles(UserRole.CEO));

router.route('/').get(getPermissions).put(updatePermissions);

export default router;
