// project.model.ts

import { Schema, model, Document } from 'mongoose';
import { type User } from '../settings/users/users.model.js';
import { getMainDb } from '../../../config/db.js';

// Remove the enum and rely on the string values directly
const ProjectCategories = ['Cybersecurity', 'Web Development'];

export enum ProjectStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  ON_HOLD = 'On Hold',
}

export interface IProject extends Document {
  name: string;
  description: string;
  category: 'Cybersecurity' | 'Web Development'; // Use string literal union
  status: ProjectStatus;
  startDate: Date;
  endDate?: Date;
  team: Schema.Types.ObjectId[] | (typeof User)[];
  client: Schema.Types.ObjectId;
  clientFeedback?: string;
  website_link?: string;
  target_systems?: string; // <--- ADDED to interface
}

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ProjectCategories, // Use the array for validation
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      default: ProjectStatus.NOT_STARTED,
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    team: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    client: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    clientFeedback: { type: String },
    website_link: { type: String },
    target_systems: { type: String }, // <--- ADDED to schema
  },
  { timestamps: true }
);

export const Project = getMainDb().model<IProject>('Project', projectSchema);