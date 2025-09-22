import { Router } from 'express';
import {
  getFeedback,
  acknowledgeFeedback,
  submitFeedback,
} from './feedback.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { protectClient } from '../../middleware/protectClient.middleware.js';

const router = Router();

// --- Client Route ---
router.post('/portal', protectClient, submitFeedback);

// --- Admin Routes ---
router.get('/', protect, getFeedback);
router.delete('/:type/:id', protect, acknowledgeFeedback);

export default router;
