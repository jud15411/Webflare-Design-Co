// server/src/projects/project.model.ts

import { Schema, model, Document } from 'mongoose';
import { type User } from '../auth/user.model.js'; // Assuming you want to link users

export enum ProjectCategory {
  CYBERSECURITY = 'Cybersecurity',
  WEB_DEVELOPMENT = 'Web Development',
}

export enum ProjectStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  ON_HOLD = 'On Hold',
}

export interface IProject extends Document {
  name: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  startDate: Date;
  endDate?: Date;
  team: Schema.Types.ObjectId[] | (typeof User)[];
}

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: Object.values(ProjectCategory),
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
  },
  { timestamps: true }
);

export const Project = model<IProject>('Project', projectSchema);
