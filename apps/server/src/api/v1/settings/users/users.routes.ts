import { Router } from 'express';
import {
  getMfaSettings,
  updateMfaSettings,
  getPermissions,
  updatePermissions,
} from './users.controller.js';
import roleRoutes from '../../../v1/roles/roles.routes.js'; // Use your existing roles routes

const router = Router();

// MFA Enforcement
router.route('/mfa').get(getMfaSettings).put(updateMfaSettings);

// Role-Based Permissions
router.route('/permissions').get(getPermissions).put(updatePermissions);

// Mount the roles routes you already have
router.use('/roles', roleRoutes);

export default router;
