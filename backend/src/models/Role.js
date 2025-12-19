const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  branch: {
    type: String,
    required: true,
    enum: ['admin', 'web_dev', 'cyber_security'],
  },
  permissions: [{ type: String }],
  isSystemRole: { type: Boolean, default: false },
});

module.exports = mongoose.model('Role', RoleSchema);
