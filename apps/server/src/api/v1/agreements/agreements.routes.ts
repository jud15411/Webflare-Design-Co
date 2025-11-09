import { Router } from 'express';
import {
  getAgreements,
  addAgreement,
  updateAgreement,
  deleteAgreement,
} from './agreements.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { UserRole } from '../settings/users/users.model.js';

const router = Router();

// Protect all agreement routes for CEOs only
router.use(protect, authorizeRoles(UserRole.CEO));

router.route('/').get(getAgreements).post(addAgreement);

router.route('/:id').put(updateAgreement).delete(deleteAgreement);

export default router;
