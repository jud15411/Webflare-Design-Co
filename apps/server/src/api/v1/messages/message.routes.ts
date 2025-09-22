import { Router } from 'express';
import { getMessagesForProject } from './message.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
// We might add protectClient middleware here later for portal access
// import { protectClient } from '../../middleware/protectClient.middleware.js';

const router = Router();

// This route should be protected for both staff and clients
router.get('/:projectId', protect, getMessagesForProject);

export default router;
