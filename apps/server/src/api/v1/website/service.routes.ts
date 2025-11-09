import { Router } from 'express';
import {
  getServices, createService, updateService, deleteService, getPublicServices,
} from './service.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { UserRole } from '../settings/users/users.model.js';

const router = Router();
const publicRouter = Router();

// Admin Routes (protected for CEO and Admin)
router.use(protect, authorizeRoles(UserRole.CEO));
router.route('/').get(getServices).post(createService);
router.route('/:id').put(updateService).delete(deleteService);

// Public Route (for your live website to fetch services)
publicRouter.get('/services', getPublicServices);

export { router as adminServiceRoutes, publicRouter as publicServiceRoutes };