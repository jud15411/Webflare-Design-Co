const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Role = require('../models/Role');
const logger = require('../utils/logger');
const { protect } = require('../middleware/authMiddleware');
const verifyCsrf = require('../middleware/csrfProtection');
const authorize = require('../middleware/authorize');
const PERMISSIONS = require('../config/permissions');

/**
 * HELPER: Branch Inheritance Defaults
 */
const getBranchBasePermissions = (branch) => {
  switch (branch) {
    case 'web_dev':
      return [PERMISSIONS.WEB_VIEW_PROJECTS, PERMISSIONS.WEB_MONITOR_UPTIME];
    case 'cyber_security':
      return [PERMISSIONS.CYBER_VIEW_VULNS, PERMISSIONS.CYBER_VIEW_TRAFFIC];
    case 'admin':
      return [PERMISSIONS.SYS_VIEW_AUDIT_ALL, PERMISSIONS.SYS_MANAGE_USERS];
    default:
      return [];
  }
};

/**
 * HELPER: Security Isolation
 */
const checkBranchAccess = (user, targetBranch) => {
  if (user.branch === 'admin') return true;
  return user.branch === targetBranch;
};

// ==========================================
// 1. PERMISSION DISCOVERY
// ==========================================

router.get('/permissions/list', protect, verifyCsrf, (req, res) => {
  res.json(Object.values(PERMISSIONS));
});

// ==========================================
// 2. USER MANAGEMENT
// ==========================================

router.get('/users', protect, verifyCsrf, async (req, res) => {
  try {
    let query = {};
    // Only filter if NOT a global admin
    if (req.user && req.user.branch !== 'admin') {
      query.branch = req.user.branch;
    }
    const users = await User.find(query).populate('role');
    res.json(users);
  } catch (err) {
    logger.error('Orchestrator: Fetch users failed', { error: err.message });
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/users/:id/role', protect, verifyCsrf, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    if (!checkBranchAccess(req.user, targetUser.branch)) {
      return res
        .status(403)
        .json({ message: 'Access Denied: Cannot modify other branches' });
    }

    targetUser.role = req.body.roleId;
    await targetUser.save();

    logger.info('User role updated', {
      by: req.user.userName, // Fixed reference
      target: targetUser.userName,
      newRoleId: req.body.roleId,
    });

    res.json({ message: 'Role assigned successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 3. ROLE & BRANCH MANAGEMENT
// ==========================================

router.get('/roles', protect, verifyCsrf, async (req, res) => {
  try {
    let query = {};
    if (req.user && req.user.branch !== 'admin') {
      query.branch = req.user.branch;
    }
    const roles = await Role.find(query);
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching roles' });
  }
});

router.post(
  '/roles',
  protect,
  verifyCsrf,
  authorize(PERMISSIONS.SYS_MANAGE_ROLES),
  async (req, res) => {
    const { name, branch } = req.body;

    if (req.user.branch !== 'admin') {
      return res
        .status(403)
        .json({ message: 'Only Global Admins can provision new roles' });
    }

    try {
      const inheritedPermissions = getBranchBasePermissions(branch);
      const newRole = new Role({
        name,
        branch,
        permissions: inheritedPermissions,
        isSystemRole: false,
      });

      await newRole.save();

      logger.info('New role created', {
        by: req.user.userName,
        roleName: newRole.name,
        branch: newRole.branch,
        event: 'ROLE_CREATE',
      });

      res.status(201).json(newRole);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

router.patch('/roles/:id', protect, verifyCsrf, async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });

    if (!checkBranchAccess(req.user, role.branch)) {
      return res
        .status(403)
        .json({ message: 'Access Denied: Branch mismatch' });
    }

    if (role.isSystemRole) {
      return res
        .status(403)
        .json({ message: 'Cannot modify protected System Roles' });
    }

    role.permissions = req.body.permissions;
    await role.save();

    logger.info('Role permissions updated', {
      by: req.user.userName,
      roleName: role.name,
      branch: role.branch,
      event: 'ROLE_UPDATE',
    });

    setTimeout(() => {
      return res.json(role);
    }, 100);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
