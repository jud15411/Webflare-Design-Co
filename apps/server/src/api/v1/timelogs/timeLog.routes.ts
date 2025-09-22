import express from 'express';
import {
  clockIn,
  clockOut,
  getStatus,
  getTimeLogsReport, // Import the new function
} from './timeLog.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Existing routes
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.get('/status', getStatus);

// New route for time log reports
router.get('/reports', getTimeLogsReport);

export default router;
