import { Router } from 'express';
import {
  getServices,
  addService,
  updateService,
  deleteService,
} from './services.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { UserRole } from '../settings/users/users.model.js';

const router = Router();

// Protect all service routes
router.use(protect, authorizeRoles(UserRole.CEO));

router.route('/').get(getServices).post(addService);

router.route('/:id').put(updateService).delete(deleteService);

export default router;
