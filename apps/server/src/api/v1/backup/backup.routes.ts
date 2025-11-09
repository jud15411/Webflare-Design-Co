import { Router } from 'express';
import {
  getBackupPoints,
  createBackup,
  restoreBackup,
} from './backup.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { UserRole } from '../settings/users/users.model.js';

const router = Router();

// Protect all backup routes for CEOs only
router.use(protect, authorizeRoles(UserRole.CEO));

router.route('/').get(getBackupPoints).post(createBackup);

router.route('/:id/restore').post(restoreBackup);

export default router;
