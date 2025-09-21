import { Schema, model, Document, Types } from 'mongoose';

export interface ISchedule extends Document {
  user: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: 'Draft' | 'Published';
  notes?: string;
}

const scheduleSchema = new Schema<ISchedule>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Index for faster queries by user
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Draft',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Schedule = model<ISchedule>('Schedule', scheduleSchema);
