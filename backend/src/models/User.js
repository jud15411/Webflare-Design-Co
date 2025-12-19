const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },

    // Link to the Branch model (Admin, WebDev, CyberSec)
    branch: {
      type: String,
      required: true,
      enum: ['admin', 'web_dev', 'cyber_security'],
    },

    // Link to the dynamic Role model
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },

    // Security & Audit fields
    status: {
      type: String,
      enum: ['active', 'suspended', 'pending'],
      default: 'pending',
    },
    lastLogin: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12); // Using 12 rounds for better security
});

// Verification method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
