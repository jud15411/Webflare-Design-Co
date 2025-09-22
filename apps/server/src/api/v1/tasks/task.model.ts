import { Schema, model, Document, Types } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Done';
  category: 'Cybersecurity' | 'Web Development';
  dueDate: Date;
  assignedTo: Types.ObjectId;
  project: Types.ObjectId;
  clientFeedback?: string; // <-- Add this line
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Done'],
      default: 'To Do',
    },
    category: {
      type: String,
      enum: ['Cybersecurity', 'Web Development'],
      required: true,
    },
    dueDate: { type: Date, required: true },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    clientFeedback: { type: String }, // <-- Add this line
  },
  { timestamps: true }
);

export const Task = model<ITask>('Task', taskSchema);
