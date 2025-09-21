import express from 'express';
import {
  createSchedule,
  getSchedules,
  publishSchedules,
} from './schedules.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { UserRole } from '../auth/user.model.js'; // Import the UserRole enum

const router = express.Router();

// Only CEO can manage schedules
router.use(protect, authorizeRoles(UserRole.CEO)); // Use the enum member

router.route('/').post(createSchedule).get(getSchedules);
router.route('/publish').patch(publishSchedules);

export default router;
