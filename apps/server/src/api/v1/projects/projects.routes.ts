// server/src/projects/projects.routes.ts

import { Router } from 'express';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from './projects.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = Router();

// All routes in this file are protected
router.use(protect);

router.route('/').get(getProjects); // We'll add POST later

router.route('/').get(getProjects).post(createProject);
router.route('/:id').put(updateProject).delete(deleteProject);

export default router;
