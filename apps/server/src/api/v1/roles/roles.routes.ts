import { Router } from 'express';
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from './roles.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { UserRole } from '../auth/user.model.js';

const router = Router();

// Route to get all roles is accessible by any authenticated user
router.get('/', protect, getRoles);

// Routes to create, update, and delete roles are for CEOs only
router.use(protect, authorizeRoles(UserRole.CEO));
router.post('/', createRole);
router.route('/:id').put(updateRole).delete(deleteRole);

export default router;
