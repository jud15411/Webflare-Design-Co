// src/api/v1/client-portal/projects/projects.controller.ts

import { type Response } from 'express';
import { type AuthClientRequest } from '../../../middleware/protectClient.middleware.js';
import { Project } from '../../projects/project.model.js';
import mongoose from 'mongoose';

export const getProjectById = async (req: AuthClientRequest, res: Response) => {
  try {
    const { id: projectId } = req.params;
    const clientId = req.clientUser!.client._id;

    // First, check if projectId exists. If not, or if it's invalid, return 404.
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Find the project ONLY if it matches the ID AND belongs to the logged-in client
    const project = await Project.findOne({
      _id: projectId,
      client: clientId,
    }).populate('team', 'name'); // Populate the names of assigned team members

    if (!project) {
      // If no project is found, return 404 for security
      return res.status(404).json({ message: 'Project not found.' });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching project details.' });
  }
};
