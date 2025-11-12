import express from 'express';
import {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
  togglePortalAccess, // Ensure this import is present
} from './client.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
// 1. Import the role authorization middleware
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { UserRole } from '../settings/users/users.model.js';

const router = express.Router();

// 2. Protect all routes to ensure user is logged in
router.use(protect);

// 3. Apply role-based authorization for specific actions

// Get Clients (Allow CEO and Sales to view)
router.route('/').get(authorizeRoles(UserRole.CEO, UserRole.SALES), getClients);

// Create Client (Only allow CEO)
router.route('/').post(authorizeRoles(UserRole.CEO), createClient);

// Single Client Actions
router
  .route('/:id')
  .get(authorizeRoles(UserRole.CEO, UserRole.SALES), getClientById)
  .put(authorizeRoles(UserRole.CEO), updateClient)
  .delete(authorizeRoles(UserRole.CEO), deleteClient);

// NEW: Toggle Portal Access Route (Only allow CEO)
router
  .route('/:id/portal-access')
  .patch(authorizeRoles(UserRole.CEO), togglePortalAccess);

export default router;