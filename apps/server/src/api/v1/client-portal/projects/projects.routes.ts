// src/api/v1/client-portal/projects/projects.routes.ts

import { Router } from 'express';
import { getProjectById } from './projects.controller.js';
import { protectClient } from '../../../middleware/protectClient.middleware.js';

const router = Router();

// This route is protected by the client auth middleware
router.get('/:id', protectClient, getProjectById);

export default router;
