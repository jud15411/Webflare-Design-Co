const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    // --- A. Public Registry Info (Visible to All) ---
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    logoUrl: { type: String },
    industry: { type: String },
    status: {
      type: String,
      enum: ['Active', 'Onboarding', 'Archived'],
      default: 'Onboarding',
    },

    // --- B. Admin & Financial Info (Admin Branch Only) ---
    adminData: {
      contractValue: { type: Number },
      billingCycle: { type: String, enum: ['Monthly', 'Quarterly', 'Annual'] },
      primaryContact: {
        name: String,
        email: String,
        phone: String,
      },
      internalNotes: { type: String }, // For Admin's eyes only
    },

    // --- C. Web Branch Specifics ---
    webData: {
      productionUrl: { type: String },
      stagingUrl: { type: String },
      techStack: [String], // e.g., ["React", "Node.js"]
      hostingProvider: { type: String },
    },

    // --- D. Cyber Branch Specifics ---
    cyberData: {
      securityTier: { type: String },
      lastAuditDate: { type: Date },
      ipWhitelist: [String],
      complianceRequirements: [String], // e.g., ["HIPAA", "SOC2"]
    },

    // Traceability
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Client', clientSchema);
