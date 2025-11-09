// src/api/v1/projects/projects.routes.ts

import { Router } from 'express';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectById,
} from './projects.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
// 1. Import your role authorization middleware
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { UserRole } from '../settings/users/users.model.js'; // Assuming you have role enums

const router = Router();

// All routes in this file are protected, so users must be logged in.
router.use(protect);

// 2. Apply role-specific authorization to routes
// Anyone logged in can view projects
router.route('/').get(getProjects);
router.route('/:id').get(getProjectById);

// Only CEOs can create, update, or delete projects
router.route('/').post(authorizeRoles(UserRole.CEO), createProject);
router.route('/:id')
  .put(authorizeRoles(UserRole.CEO), updateProject)
  .delete(authorizeRoles(UserRole.CEO), deleteProject);

export default router;