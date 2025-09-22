import { type Request, type Response } from 'express';
import { Project, ProjectCategory, ProjectStatus } from './project.model.js';
import { Message } from '../messages/message.model.js';

/**
 * @desc    Get all projects, optionally filtered by category
 * @route   GET /api/v1/projects
 * @access  Private
 */
export const getProjects = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const filter: { category?: ProjectCategory } = {};

    if (
      category &&
      Object.values(ProjectCategory).includes(category as ProjectCategory)
    ) {
      filter.category = category as ProjectCategory;
    }

    const projects = await Project.find(filter)
      .populate('team', 'name email')
      .populate('client', 'clientName');
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error while fetching projects.' });
  }
};

/**
 * @desc    Create a new project
 * @route   POST /api/v1/projects
 * @access  Private
 */
export const createProject = async (req: Request, res: Response) => {
  try {
    // Add 'team' to the destructured properties
    const { name, description, category, status, startDate, client, team } =
      req.body;
    const newProject = new Project({
      name,
      description,
      category,
      status,
      startDate,
      client,
      team, // Add team to the new project object
    });
    const savedProject = await newProject.save();
    // Populate both client and team for the response
    await savedProject.populate(['client', 'team']);
    res.status(201).json(savedProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server error while creating project.' });
  }
};

/**
 * @desc    Update an existing project
 * @route   PUT /api/v1/projects/:id
 * @access  Private
 */
export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedProject = await Project.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate(['client', 'team']); // Populate both client and team

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (updatedProject.status === ProjectStatus.COMPLETED) {
      await Message.deleteMany({ project: updatedProject._id });
    }

    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server error while updating project.' });
  }
};

/**
 * @desc    Delete a project
 * @route   DELETE /api/v1/projects/:id
 * @access  Private
 */
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedProject = await Project.findByIdAndDelete(id);
    if (!deletedProject) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    res.status(200).json({ message: 'Project deleted successfully.' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server error while deleting project.' });
  }
};
