// sprint.model.ts

import { Schema, Document, Types } from 'mongoose';
import { getMainDb } from '../../../config/db.js';

export interface ISprint extends Document {
  name: string;
  startDate: Date;
  endDate: Date; // Calculated as startDate + 3 weeks
  status: 'Planning' | 'Active' | 'Completed';
  project: Types.ObjectId; // Sprints are connected to projects
}

const sprintSchema = new Schema<ISprint>({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Planning', 'Active', 'Completed'], 
    default: 'Planning' 
  },
  project: { 
    type: Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
}, { timestamps: true });

export const Sprint = getMainDb().model<ISprint>('Sprint', sprintSchema);