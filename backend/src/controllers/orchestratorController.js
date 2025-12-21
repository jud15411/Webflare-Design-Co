const User = require('../models/User');
const Role = require('../models/Role');
const PERMISSIONS = require('../config/permissions');
const logger = require('../utils/logger');

// Helper for branch security
const checkBranchAccess = (user, targetBranch) => {
  if (user.branch === 'admin') return true;
  return user.branch === targetBranch;
};

exports.getUsers = async (req, res) => {
  try {
    const query =
      req.user.branch === 'admin' ? {} : { branch: req.user.branch };
    const users = await User.find(query).populate('role', 'name');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createRole = async (req, res) => {
  const { name, branch } = req.body;
  if (!checkBranchAccess(req.user, branch)) {
    return res
      .status(403)
      .json({ message: 'Access Denied: Cannot provision for other branches' });
  }
  try {
    const newRole = new Role({
      name,
      branch,
      permissions: [],
      isSystemRole: false,
    });
    await newRole.save();
    logger.info('Role created', { by: req.user.userName, roleName: name });
    res.status(201).json(newRole);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// @desc    Update existing role
// @route   PATCH /api/orchestrator/roles/:id
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, permissions, branch } = req.body;

    // Security check: Only admins can change branches or edit roles outside their branch
    if (req.user.branch !== 'admin' && branch && branch !== req.user.branch) {
      return res
        .status(403)
        .json({ message: 'Forbidden: Cannot move roles to other branches' });
    }

    const updatedRole = await Role.findByIdAndUpdate(
      id,
      { name, permissions, branch },
      { new: true, runValidators: true }
    );

    if (!updatedRole) {
      return res.status(404).json({ message: 'Role not found' });
    }

    logger.info('Role Updated', {
      by: req.user.userName,
      roleId: id,
      newName: name,
    });

    res.json(updatedRole);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get all available roles (Filtered by branch)
// @route   GET /api/orchestrator/roles
exports.getRoles = async (req, res) => {
  try {
    // Security: Non-admins can only see roles for their own branch
    let query = {};
    if (req.user.branch !== 'admin') {
      query.branch = req.user.branch;
    }

    const roles = await Role.find(query);
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

// @desc    Expose the PERMISSIONS config to the frontend
// @route   GET /api/orchestrator/permissions
exports.getPermissionManifest = (req, res) => {
  // Convert { KEY: 'value' } to ['value1', 'value2']
  const permissionsArray = Object.values(PERMISSIONS);
  res.json(permissionsArray);
};

// Update this function to ensure clean array output
exports.getPermissionManifest = (req, res) => {
  try {
    const permissionsArray = Object.values(PERMISSIONS);
    res.json(permissionsArray);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate manifest' });
  }
};
