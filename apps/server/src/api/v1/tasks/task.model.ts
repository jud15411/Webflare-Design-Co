// task.model.ts

import { Schema, Document, Types } from 'mongoose';
import { getMainDb } from '../../../config/db.js';

export interface ITask extends Document { 
  title: string; 
  description: string; 
  status: 'To Do' | 'In Progress' | 'Done'; 
  category: 'Cybersecurity' | 'Web Development'; 
  dueDate: Date; 
  assignedTo: Types.ObjectId; 
  project: Types.ObjectId; 
  sprint?: Types.ObjectId | null; // FIXED: Explicitly allow null
  storyPoints?: number; 
  clientFeedback?: string; 
}
const taskSchema = new Schema<ITask>({ 
  title: { type: String, required: true, trim: true }, 
  description: { type: String, trim: true }, 
  status: { type: String, enum: ['To Do', 'In Progress', 'Done'], default: 'To Do' }, 
  category: { type: String, enum: ['Cybersecurity', 'Web Development'], required: true }, 
  dueDate: { type: Date, required: true }, 
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true }, 
  sprint: { type: Schema.Types.ObjectId, ref: 'Sprint', required: false }, // Updated
  storyPoints: { type: Number, required: false }, // Updated
  clientFeedback: { type: String } 
}, { timestamps: true });
export const Task = getMainDb().model<ITask>('Task', taskSchema);