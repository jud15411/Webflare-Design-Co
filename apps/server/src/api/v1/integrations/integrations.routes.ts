import { Router } from 'express';
import {
  getApiKeys,
  addApiKey,
  deleteApiKey,
} from './integrations.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { UserRole } from '../settings/users/users.model.js';

const router = Router();

// Protect all integration routes for CEOs only
router.use(protect, authorizeRoles(UserRole.CEO));

router.route('/').get(getApiKeys).post(addApiKey);

router.route('/:id').delete(deleteApiKey);

export default router;
