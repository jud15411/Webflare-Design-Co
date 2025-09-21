import { Schema, model, Document } from 'mongoose';

// Interface to represent the software asset document
export interface ISoftwareAsset extends Document {
  name: string;
  licenseKey: string;
  purchaseDate: Date;
  assignedTo: Schema.Types.ObjectId; // Reference to the user the software is assigned to
  assignedToName: string; // The name of the user assigned to the software
  notes?: string;
}

// Schema definition for the software asset
const softwareAssetSchema = new Schema<ISoftwareAsset>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    licenseKey: {
      type: String,
      required: true,
      unique: true,
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedToName: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      required: false,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

// Export the model
export const SoftwareAsset = model<ISoftwareAsset>(
  'SoftwareAsset',
  softwareAssetSchema
);
