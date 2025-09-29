import mongoose, { Schema, Document } from 'mongoose';
// 1. Import the "getter" function, not the variable or the connect function
import { getPublicDb } from '../../../config/db.js';

export interface IService extends Document {
  name: string;
  description: string;
  icon?: string;
  isActive: boolean;
}

const serviceSchema = new Schema<IService>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    icon: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 2. Use the getter function to safely retrieve the connection and define the model
const Service = getPublicDb().model<IService>('Service', serviceSchema);

export { Service };