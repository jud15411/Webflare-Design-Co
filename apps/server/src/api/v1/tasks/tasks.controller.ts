import { type Request, type Response } from 'express';
import { Task } from './task.model.js';

// @desc    Get all tasks
// @route   GET /api/v1/tasks
export const getTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find({})
      .populate('assignedTo', 'name')
      .populate({
        // <-- Update population to include project and its client
        path: 'project',
        select: 'name client',
        populate: {
          path: 'client',
          select: 'clientName',
        },
      });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching tasks.' });
  }
};

// @desc    Create a new task
// @route   POST /api/v1/tasks
export const createTask = async (req: Request, res: Response) => {
  try {
    // Add project to destructuring
    const {
      title,
      description,
      status,
      category,
      dueDate,
      assignedTo,
      project,
    } = req.body;

    // Add project to validation
    if (!title || !category || !dueDate || !assignedTo || !project) {
      return res
        .status(400)
        .json({ message: 'Please provide all required fields.' });
    }

    const task = new Task({
      title,
      description,
      status,
      category,
      dueDate,
      assignedTo,
      project, // Add project to task creation
    });

    const createdTask = await task.save();
    // Populate the project and user details before sending back
    await createdTask.populate('assignedTo', 'name');
    await createdTask.populate({
      path: 'project',
      select: 'name client',
      populate: {
        path: 'client',
        select: 'clientName',
      },
    });
    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error while creating task.' });
  }
};

// @desc    Update a task
// @route   PATCH /api/v1/tasks/:id
export const updateTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);

    if (task) {
      // Update fields from request body
      task.title = req.body.title || task.title;
      task.description = req.body.description || task.description;
      task.status = req.body.status || task.status;
      task.category = req.body.category || task.category;
      task.dueDate = req.body.dueDate || task.dueDate;
      task.assignedTo = req.body.assignedTo || task.assignedTo;
      task.project = req.body.project || task.project; // Add project update

      const updatedTask = await task.save();
      await updatedTask.populate('assignedTo', 'name');
      await updatedTask.populate({
        path: 'project',
        select: 'name client',
        populate: {
          path: 'client',
          select: 'clientName',
        },
      });
      res.status(200).json(updatedTask);
    } else {
      res.status(404).json({ message: 'Task not found.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating task.' });
  }
};

// @desc    Delete a task
// @route   DELETE /api/v1/tasks/:id
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);

    if (task) {
      await task.deleteOne();
      res.status(200).json({ message: 'Task removed successfully.' });
    } else {
      res.status(404).json({ message: 'Task not found.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting task.' });
  }
};
