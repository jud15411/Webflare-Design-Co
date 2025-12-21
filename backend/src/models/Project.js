// models/Project.js
const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, unique: true },
  description: { type: String },
  branch: { type: String, required: true },
  status: { type: String, default: 'active' },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  // ADD THIS: Support for the technical configurations from the Modal
  metadata: {
    environment: { type: String, default: 'production' },
    priority: { type: String, default: 'medium' },
    tags: [String],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Project', ProjectSchema);
