import express from 'express';
import {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
  togglePortalAccess,
} from './client.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
// 1. Import the role authorization middleware
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { UserRole } from '../auth/user.model.js';

const router = express.Router();

// 2. Protect all routes to ensure user is logged in
router.use(protect);

// 3. Apply role-based authorization for specific actions
// Allow CEO and Sales to view clients
router.route('/').get(authorizeRoles(UserRole.CEO, UserRole.SALES), getClients);

// Only allow CEO to create, update, and delete clients
router.route('/').post(authorizeRoles(UserRole.CEO), createClient);
router
  .route('/:id')
  .get(authorizeRoles(UserRole.CEO, UserRole.SALES), getClientById)
  .put(authorizeRoles(UserRole.CEO), updateClient)
  .delete(authorizeRoles(UserRole.CEO), deleteClient);

router
  .route('/:id/portal-access')
  .patch(authorizeRoles(UserRole.CEO), togglePortalAccess);

export default router;