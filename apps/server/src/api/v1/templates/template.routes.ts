import express from 'express';
import { seedTemplates } from './template.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

// This is a protected, one-time-use route to populate your database.
router.post('/seed', protect, seedTemplates);

export default router;
