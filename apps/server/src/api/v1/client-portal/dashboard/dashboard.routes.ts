import { Router } from 'express';
import { getDashboardData } from './dashboard.controller.js';
import { protectClient } from '../../../middleware/protectClient.middleware.js';

const router = Router();

// Protect this route with the new client-specific middleware
router.get('/', protectClient, getDashboardData);

export default router;
