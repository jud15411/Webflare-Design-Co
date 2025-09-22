import { type Response } from 'express';
import { type AuthClientRequest } from '../../../middleware/protectClient.middleware.js';
import { Project } from '../../projects/project.model.js';
import { Invoice } from '../../financials/financials.model.js';
import { Task } from '../../tasks/task.model.js'; // <-- Add Task import
import { ClientPortalSettings } from '../../settings/billing/billing.model.js';

export const getDashboardData = async (
  req: AuthClientRequest,
  res: Response
) => {
  try {
    const clientUser = req.clientUser!;
    const clientId = clientUser.client._id;

    const portalSettings = await ClientPortalSettings.findOne();

    const responseData: { projects?: any[]; invoices?: any[]; tasks?: any[] } =
      {}; // <-- Add tasks to type

    // Fetch the client's projects first
    const clientProjects = await Project.find({ client: clientId });
    const projectIds = clientProjects.map((p) => p._id);

    if (portalSettings?.showProjects) {
      responseData.projects = clientProjects;
    }

    if (portalSettings?.showInvoices) {
      responseData.invoices = await Invoice.find({ client: clientId });
    }

    // Conditionally fetch tasks related to the client's projects
    if (portalSettings?.showTasks && projectIds.length > 0) {
      responseData.tasks = await Task.find({ project: { $in: projectIds } })
        .select('title status dueDate project') // Select specific fields
        .populate('project', 'name'); // Populate project name
    }

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching dashboard data.' });
  }
};
