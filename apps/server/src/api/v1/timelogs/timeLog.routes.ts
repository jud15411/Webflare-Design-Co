import express from 'express';
import { clockIn, clockOut, getStatus } from './timeLog.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

// All logged-in users can access these
router.use(protect);

router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.get('/status', getStatus);

export default router;
