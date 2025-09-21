import express from 'express';
import {
  createRequest,
  getPendingRequests,
  updateRequestStatus,
} from './clockInRequest.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Employee can create a request
router.post('/clock-in', protect, createRequest);

// Admin can view and manage requests
router.get('/clock-in', protect, authorize('CEO'), getPendingRequests);
router.patch('/clock-in/:id', protect, authorize('CEO'), updateRequestStatus);

export default router;
