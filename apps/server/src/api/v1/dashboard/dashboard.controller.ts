import { type Request, type Response } from 'express';
import { Client } from '../client/client.model.js';
import { Project, ProjectStatus } from '../projects/project.model.js';
import { Invoice } from '../financials/financials.model.js';
import { Task } from '../tasks/task.model.js';

export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    // 1. Get Active Clients Count
    const activeClients = await Client.countDocuments({ status: 'Active' });

    // 2. Get Projects Completed This Month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const projectsCompleted = await Project.countDocuments({
      status: ProjectStatus.COMPLETED,
      endDate: { $gte: startOfMonth },
    });

    // 3. Calculate Total Revenue from Paid Invoices
    const revenueResult = await Invoice.aggregate([
      { $match: { status: 'Paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // 4. Get Open Tasks Count
    const openTasks = await Task.countDocuments({
      status: { $in: ['To Do', 'In Progress'] },
    });

    res.status(200).json({
      activeClients,
      projectsCompleted,
      totalRevenue,
      openTasks,
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res
      .status(500)
      .json({ message: 'Server error fetching dashboard metrics.' });
  }
};
