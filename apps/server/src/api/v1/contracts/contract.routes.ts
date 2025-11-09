import express from 'express';
import {
  createContract,
  getContracts,
  getContractById,
  updateContractStatus,
  updateContract,
  generateContract,
} from './contract.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { UserRole } from '../settings/users/users.model.js';

const router = express.Router();

// All contract routes are protected and restricted to CEOs
router.use(protect, authorizeRoles(UserRole.CEO));

router.route('/').post(createContract).get(getContracts);
router.route('/:id').get(getContractById);
router.route('/:id/status').patch(updateContractStatus);
router.route('/:id').get(getContractById).put(updateContract);
router.route('/:id/generate').get(generateContract);

export default router;
