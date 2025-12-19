// src/routes/admin.js
const router = require('express').Router();
const User = require('../models/User');
const Role = require('../models/Role');
const logger = require('../utils/logger');
const { authorize, checkBranch } = require('../middleware/authMiddleware');

// GET all users (Tiered filtering)
router.get('/users', async (req, res) => {
  try {
    let query = {};

    // Tiered Logic: If not a top-level Admin, restrict to their branch
    if (req.user.branch !== 'admin') {
      query.branch = req.user.branch;
    }

    const users = await User.find(query).populate('role', 'name');
    res.json(users);
  } catch (err) {
    logger.error('Failed to fetch orchestrated users', { error: err.message });
    res.status(500).send('Server Error');
  }
});

// Create/Provision User (SuperAdmin only)
router.post('/provision-user', async (req, res) => {
  if (req.user.branch !== 'admin')
    return res.status(403).json({ msg: 'Access Denied' });

  const { userName, email, firstName, lastName, password, branch, roleId } =
    req.body;
  try {
    const newUser = new User({
      userName,
      email,
      firstName,
      lastName,
      password,
      branch,
      role: roleId,
      status: 'active',
    });
    await newUser.save();

    logger.info('New user provisioned', {
      admin: req.user.userName,
      targetUser: userName,
      branch,
    });
    res.json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
