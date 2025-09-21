import { Router, type RequestHandler } from 'express';
import {
  getAllUsers,
  updateUserRole,
  addUser,
  updateUserProfile,
  removeUser, // Import removeUser
  toggleUserStatus,
} from './users.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { UserRole } from '../auth/user.model.js';

const router = Router();

// --- Profile Route (for the logged-in user) ---
router
  .route('/profile')
  .patch(protect, updateUserProfile as unknown as RequestHandler);

// --- Admin Routes (for CEOs only) ---
router.use(protect, authorizeRoles(UserRole.CEO));

router.route('/').get(getAllUsers).post(addUser);

// Update this route to include the DELETE method
router.route('/:id').put(updateUserRole).delete(removeUser);

router.route('/:id/status').patch(toggleUserStatus);

export default router;
