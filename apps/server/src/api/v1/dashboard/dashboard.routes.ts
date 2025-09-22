import { Router } from 'express';
import { getDashboardMetrics } from './dashboard.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = Router();

// Protect the dashboard route
router.get('/', protect, getDashboardMetrics);

export default router;
