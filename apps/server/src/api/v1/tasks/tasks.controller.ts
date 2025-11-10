// tasks.controller.ts

import { type Request, type Response } from 'express';
import { Task } from './task.model.js';

// @desc    Get all tasks
// @route   GET /api/v1/tasks
export const getTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find({})
      .populate('assignedTo', 'name')
      .populate({
        path: 'project',
        select: 'name client',
        populate: {
          path: 'client',
          select: 'clientName',
        },
      })
      .populate('sprint', 'name startDate endDate status'); 
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching tasks.' });
  }
};

// @desc    Create a new task
// @route   POST /api/v1/tasks
export const createTask = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      status,
      category,
      dueDate,
      assignedTo,
      project,
      storyPoints, 
      sprint, 
    } = req.body;

    // storyPoints is now required for planning
    if (!title || !category || !dueDate || !assignedTo || !project || storyPoints === undefined) {
      return res
        .status(400)
        .json({ message: 'Please provide all required fields (title, category, dueDate, assignedTo, project, storyPoints).' });
    }
    
    // Convert empty string from frontend select to null
    const finalSprint = (sprint === '' || sprint === undefined) ? null : sprint;


    const task = new Task({
      title,
      description,
      status,
      category,
      dueDate,
      assignedTo,
      project,
      storyPoints, 
      sprint: finalSprint, // Use the cleaned sprint value
    });

    const createdTask = await task.save();
    // Populate the project, user, and sprint details before sending back
    await createdTask.populate('assignedTo', 'name');
    await createdTask.populate({
      path: 'project',
      select: 'name client',
      populate: {
        path: 'client',
        select: 'clientName',
      },
    });
    await createdTask.populate('sprint', 'name startDate endDate status'); 
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
      // Use explicit checks to allow clearing fields
      task.title = req.body.title !== undefined ? req.body.title : task.title;
      task.description = req.body.description !== undefined ? req.body.description : task.description;
      task.status = req.body.status !== undefined ? req.body.status : task.status;
      task.category = req.body.category !== undefined ? req.body.category : task.category;
      task.dueDate = req.body.dueDate !== undefined ? req.body.dueDate : task.dueDate;
      task.assignedTo = req.body.assignedTo !== undefined ? req.body.assignedTo : task.assignedTo;
      task.project = req.body.project !== undefined ? req.body.project : task.project;
      task.storyPoints = req.body.storyPoints !== undefined ? req.body.storyPoints : task.storyPoints; 
      
      // FIXED LOGIC: Allow clearing the sprint by setting to null
      // The frontend sends '' or null to remove the sprint (move to backlog).
      if (req.body.sprint === null || req.body.sprint === '' || req.body.sprint === undefined) {
        task.sprint = null; // Assigning null is now explicitly allowed by ITask type and clears the ref.
      } else if (req.body.sprint !== undefined) {
        task.sprint = req.body.sprint; 
      }

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
      await updatedTask.populate('sprint', 'name startDate endDate status'); 
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