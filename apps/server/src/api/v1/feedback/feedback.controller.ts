import { type Response } from 'express';
import { type AuthRequest } from '../../middleware/auth.middleware.js';
import { type AuthClientRequest } from '../../middleware/protectClient.middleware.js';
import { Project } from '../projects/project.model.js';
import { Task } from '../tasks/task.model.js';
import mongoose from 'mongoose';

// --- Client Portal Controller ---
export const submitFeedback = async (req: AuthClientRequest, res: Response) => {
  const { type, id, feedback } = req.body;
  const clientId = req.clientUser!.client._id;

  if (!['project', 'task'].includes(type) || !id || !feedback) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    let document;
    if (type === 'project') {
      document = await Project.findOne({ _id: id, client: clientId });
    } else {
      // For tasks, we need to verify the task belongs to one of the client's projects
      const task = await Task.findById(id).populate('project');
      if ((task?.project as any)?.client.toString() === clientId.toString()) {
        document = task;
      }
    }

    if (!document) {
      return res
        .status(404)
        .json({ message: 'Item not found or access denied.' });
    }

    document.clientFeedback = feedback;
    await document.save();
    res.status(200).json({ message: 'Feedback submitted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error submitting feedback.' });
  }
};

// --- Admin Panel Controllers ---
export const getFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const projectFeedback = await Project.find({
      clientFeedback: { $exists: true, $ne: '' },
    })
      .select('name client clientFeedback')
      .populate('client', 'clientName');

    const taskFeedback = await Task.find({
      clientFeedback: { $exists: true, $ne: '' },
    })
      .select('title project clientFeedback')
      .populate({
        path: 'project',
        select: 'name client',
        populate: { path: 'client', select: 'clientName' },
      });

    res.status(200).json({ projects: projectFeedback, tasks: taskFeedback });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching feedback.' });
  }
};

export const acknowledgeFeedback = async (req: AuthRequest, res: Response) => {
  const { type, id } = req.params;

  if (!type || !id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid request.' });
  }

  try {
    const Model = type === 'project' ? Project : Task;

    // Zencoder's Fix: Use 'as any' to resolve the TypeScript union error.
    const updatedDocument = await (Model as any).findByIdAndUpdate(
      id,
      { $unset: { clientFeedback: 1 } }, // This removes the field
      { new: true }
    );

    if (!updatedDocument) {
      return res.status(404).json({ message: 'Item not found.' });
    }
    res.status(200).json({ message: 'Feedback acknowledged.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error acknowledging feedback.' });
  }
};
