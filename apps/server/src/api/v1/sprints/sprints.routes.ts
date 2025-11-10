// sprints.routes.ts

import express from 'express';
import {
  getSprints,
  createSprint,
  updateSprint,
  deleteSprint,
} from './sprints.controller.js';
import { protect } from '../../middleware/auth.middleware.js'; // Assuming auth middleware

const router = express.Router();

// Define routes
router.route('/').get(protect, getSprints).post(protect, createSprint);
router.route('/:id').patch(protect, updateSprint).delete(protect, deleteSprint); 

export default router;