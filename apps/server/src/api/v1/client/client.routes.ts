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

const router = express.Router();

// All client routes are protected
router.use(protect);

router.route('/').post(createClient).get(getClients);

router.route('/:id').get(getClientById).put(updateClient).delete(deleteClient);

router.route('/:id/portal-access').patch(togglePortalAccess);

export default router;
