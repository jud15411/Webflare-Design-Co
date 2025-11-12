// src/api/v1/clientPortal/clientProjects.routes.ts

import { Router } from 'express';
import { protectClient, type AuthClientRequest } from '../../middleware/protectClient.middleware.js';
import { Project } from '../projects/project.model.js';

const router = Router();

// Protect all client-portal project routes with client token
router.use(protectClient);

// GET /api/v1/client-portal/projects -> list projects for this client
router.get('/projects', async (req: AuthClientRequest, res) => {
  try {
    const clientField = req.clientUser!.client as any;
    const clientId = String(clientField?._id ?? clientField);
    const projects = await Project.find({ client: clientId })
      .select('name status startDate endDate category')
      .sort({ startDate: -1 });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// GET /api/v1/client-portal/projects/:id -> project details (only if belongs to this client)
router.get('/projects/:id', async (req: AuthClientRequest, res) => {
  try {
    const clientField = req.clientUser!.client as any;
    const clientId = String(clientField?._id ?? clientField);
    const project = await Project.findById(req.params.id)
      .populate('team', 'name email')
      .populate('client', 'clientName')
      .lean();

    if (!project) return res.status(404).json({ message: 'Project not found' });
    const projectClient = (project as any).client;
    const projectClientId = String(projectClient?._id ?? projectClient);
    if (projectClientId !== clientId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch project details' });
  }
});

export default router;
