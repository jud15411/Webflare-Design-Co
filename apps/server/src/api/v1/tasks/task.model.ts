import { Schema, model, Document, Types } from 'mongoose';

// The TypeScript interface for a Task document
export interface ITask extends Document {
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Done';
  category: 'Cybersecurity' | 'Web Development';
  dueDate: Date;
  assignedTo: Types.ObjectId; // Reference to the User model
}

// The Mongoose schema
const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
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
    dueDate: {
      type: Date,
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User', // This creates the link to the User collection
      required: true,
    },
  },
  { timestamps: true }
);

export const Task = model<ITask>('Task', taskSchema);
