import { Router } from 'express';
import { getReportsData } from './reports.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = Router();

// Protect the route with the `protect` middleware
router.route('/').get(protect, getReportsData);

export default router;
