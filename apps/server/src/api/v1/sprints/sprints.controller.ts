// sprints.controller.ts

import { type Request, type Response } from 'express';
import { Sprint } from './sprint.model.js';
import { Task } from '../tasks/task.model.js'; // Import Task model to handle backlog move
import { Types } from 'mongoose';

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
const THREE_WEEKS_MS = 3 * MS_PER_WEEK; // 3 weeks = 21 days

// @desc    Get all sprints (optionally filter by project)
// @route   GET /api/v1/sprints
export const getSprints = async (req: Request, res: Response) => {
  try {
    const filter: { project?: Types.ObjectId } = {};
    if (req.query.projectId) {
      filter.project = new Types.ObjectId(req.query.projectId as string);
    }
    const sprints = await Sprint.find(filter).populate('project', 'name').sort({ startDate: -1 });
    res.status(200).json(sprints);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching sprints.' });
  }
};

// @desc    Create a new 3-week sprint
// @route   POST /api/v1/sprints
export const createSprint = async (req: Request, res: Response) => {
  try {
    const { name, startDate, project } = req.body;

    if (!name || !startDate || !project) {
      return res.status(400).json({ message: 'Please provide name, startDate, and project.' });
    }
    
    // Calculate 3-week end date
    const start = new Date(startDate);
    const endDate = new Date(start.getTime() + THREE_WEEKS_MS);

    const sprint = new Sprint({
      name,
      startDate: start,
      endDate,
      project,
      status: 'Planning', // New sprints start in planning
    });

    const createdSprint = await sprint.save();
    res.status(201).json(createdSprint);
  } catch (error) {
    res.status(500).json({ message: 'Server error while creating sprint.' });
  }
};

// @desc    Update a sprint
// @route   PATCH /api/v1/sprints/:id
export const updateSprint = async (req: Request, res: Response) => {
  try {
    const sprint = await Sprint.findById(req.params.id);

    if (sprint) {
      sprint.name = req.body.name !== undefined ? req.body.name : sprint.name;
      sprint.status = req.body.status !== undefined ? req.body.status : sprint.status;
      
      // If start date is updated, recalculate the 3-week end date
      if (req.body.startDate) {
        const start = new Date(req.body.startDate);
        const endDate = new Date(start.getTime() + THREE_WEEKS_MS);
        sprint.startDate = start;
        sprint.endDate = endDate;
      }
      
      const updatedSprint = await sprint.save();
      res.status(200).json(updatedSprint);
    } else {
      res.status(404).json({ message: 'Sprint not found.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating sprint.' });
  }
};

// @desc    Delete a sprint
// @route   DELETE /api/v1/sprints/:id
export const deleteSprint = async (req: Request, res: Response) => {
  try {
    const sprint = await Sprint.findById(req.params.id);

    if (sprint) {
      // Move all associated tasks back to the backlog by removing the sprint reference
      await Task.updateMany({ sprint: sprint._id }, { $unset: { sprint: 1 } }); 
      await sprint.deleteOne();
      res.status(200).json({ message: 'Sprint deleted, associated tasks moved to backlog successfully.' });
    } else {
      res.status(404).json({ message: 'Sprint not found.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting sprint.' });
  }
};