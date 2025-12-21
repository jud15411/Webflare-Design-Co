const Client = require('../models/Client');
const logger = require('../utils/logger');

// @desc    Create new client
// @route   POST /api/clients
// @access  Private (Admin Only)
exports.createClient = async (req, res) => {
  try {
    const newClient = await Client.create({
      ...req.body,
      createdBy: req.user._id,
    });

    logger.warn('Client Created', {
      action: 'CREATE_CLIENT',
      performedBy: req.user.userName,
      clientId: newClient._id,
      clientName: newClient.name,
    });

    res.status(201).json({ success: true, data: newClient });
  } catch (err) {
    logger.error('Client Creation Failed', {
      error: err.message,
      performedBy: req.user.userName,
    });
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get all clients (Filtered Registry for all branches)
// @route   GET /api/clients/registry
// @access  Private (Global Registry Access)
exports.getClientRegistry = async (req, res) => {
  try {
    const clients = await Client.find({
      status: { $in: ['Active', 'Onboarding'] },
    }).select('name logoUrl industry status');
    res
      .status(200)
      .json({ success: true, count: clients.length, data: clients });
  } catch (err) {
    logger.error('Registry Access Error', { error: err.message });
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single client (Siloed by branch)
// @route   GET /api/clients/:id
// @access  Private
exports.getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client)
      return res
        .status(404)
        .json({ success: false, message: 'Client not found' });

    const clientObj = client.toObject();

    // Data Siloing: Hide Admin Data if not in Admin Branch or SuperAdmin
    if (
      req.user.branch !== 'admin' &&
      !req.user.role.permissions.includes('*')
    ) {
      delete clientObj.adminData;
    } else {
      logger.warn('Client Viewed (Full)', {
        action: 'VIEW_CLIENT_ADMIN',
        clientId: client._id,
        performedBy: req.user.userName,
      });
    }

    res.status(200).json({ success: true, data: clientObj });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update client details (Branch-Aware validation)
// @route   PATCH /api/clients/:id
// @access  Private
exports.updateClient = async (req, res) => {
  try {
    const { updates } = req.body;
    const userBranch = req.user.branch;

    // 1. Identify if the user is a SuperAdmin
    // We check both req.user.permissions (based on your JSON)
    // and req.user.role.permissions (for safety/consistency)
    const permissions =
      req.user.permissions || req.user.role?.permissions || [];
    const isSuperAdmin = permissions.includes('*');

    // 2. Enforcement Logic: Only run these checks if NOT a SuperAdmin
    if (!isSuperAdmin) {
      if (
        userBranch === 'web_dev' &&
        (updates.adminData || updates.cyberData)
      ) {
        return res.status(403).json({
          message: 'Access Denied: Web branch cannot edit Admin or Cyber data.',
        });
      }
      if (
        userBranch === 'cyber_security' &&
        (updates.adminData || updates.webData)
      ) {
        return res.status(403).json({
          message: 'Access Denied: Cyber branch cannot edit Admin or Web data.',
        });
      }
      if (userBranch !== 'admin' && updates.adminData) {
        return res.status(403).json({
          message: 'Access Denied: Financial data restricted to Admin branch.',
        });
      }
    }

    // 3. Perform the Update
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    logger.warn('Client Updated', {
      action: 'UPDATE_CLIENT',
      performedBy: req.user.userName,
      clientId: client._id,
      clientName: client.name,
    });

    console.log('DEBUG: Reached the success point of updateClient');

    res.status(200).json({ success: true, data: client });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete/Archive client
// @route   DELETE /api/clients/:id
// @access  Private (Admin Only)
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client)
      return res
        .status(404)
        .json({ success: false, message: 'Client not found' });

    logger.warn('Client Deleted', {
      action: 'DELETE_CLIENT',
      performedBy: req.user.userName,
      clientId: req.params.id,
      clientName: client.name,
    });

    res.status(200).json({ success: true, message: 'Client removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
