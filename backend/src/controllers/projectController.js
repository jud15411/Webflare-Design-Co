const Project = require('../models/Project');
const logger = require('../utils/logger');

// @desc    Get projects filtered by branch (Admins see all, others siloed)
// @route   GET /api/projects
exports.getProjects = async (req, res) => {
  try {
    const { branch } = req.query;
    let query = {};

    if (req.user.branch === 'admin') {
      if (branch) query.branch = branch;
    } else {
      query.branch = req.user.branch;
    }

    // Force lean() and explicit population to prevent the 500 crash
    const projects = await Project.find(query)
      .populate({
        path: 'client',
        select: 'name',
        model: 'Client', // Explicitly tell Mongoose which model to use
      })
      .populate({
        path: 'createdBy',
        select: 'userName',
        model: 'User',
      })
      .lean();

    res.json(projects);
  } catch (err) {
    console.error('DETAILED PROJECT FETCH ERROR:', err);
    res.status(500).json({
      error: 'Internal Server Error during population',
      message: err.message,
    });
  }
};

// @desc    Create a new project
// @route   POST /api/projects
exports.createProject = async (req, res) => {
  try {
    const { name, code, description, branch, status, client, metadata } =
      req.body;

    if (!client) {
      return res.status(400).json({
        success: false,
        message: 'Client association is required',
      });
    }

    const newProject = new Project({
      name,
      code,
      description,
      branch: req.user.branch === 'admin' ? branch : req.user.branch,
      status: status || 'active',
      client,
      metadata,
      createdBy: req.user._id,
    });

    await newProject.save();

    // SUCCESS LOG: Track the new project initialization
    logger.info('Project Initialized', {
      action: 'CREATE_PROJECT',
      performedBy: req.user.userName,
      projectId: newProject._id,
      projectCode: newProject.code,
      branch: newProject.branch,
    });

    res.status(201).json(newProject);
  } catch (err) {
    // ERROR LOG: Capture failure details for monitoring alerts
    logger.error('Project Creation Failed', {
      error: err.message,
      performedBy: req.user.userName,
      code: req.body.code,
    });

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: `Project code "${req.body.code}" is already in use.`,
      });
    }

    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update project
// @route   PATCH /api/projects/:id
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.user.branch !== 'admin' && project.branch !== req.user.branch) {
      logger.warn('Unauthorized Project Update Attempt', {
        action: 'UPDATE_PROJECT_DENIED',
        performedBy: req.user.userName,
        projectId: id,
        reason: 'Branch Silo Violation',
      });
      return res
        .status(403)
        .json({ message: 'Access Denied: Branch Silo Violation' });
    }

    const updatedProject = await Project.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    // SUCCESS LOG: Track the modification
    logger.info('Project Updated', {
      action: 'UPDATE_PROJECT',
      performedBy: req.user.userName,
      projectId: updatedProject._id,
      projectCode: updatedProject.code,
    });

    res.json(updatedProject);
  } catch (err) {
    logger.error('Project Update Failed', {
      error: err.message,
      performedBy: req.user.userName,
      projectId: req.params.id,
    });
    res.status(500).json({ error: err.message });
  }
};
