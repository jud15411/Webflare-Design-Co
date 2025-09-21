import { Schema, model, Document, Types } from 'mongoose';

export interface ITimeLog extends Document {
  user: Types.ObjectId;
  schedule?: Types.ObjectId;
  clockInTime: Date;
  clockOutTime?: Date;
  duration?: number; // Duration in minutes
  isApprovedOverride: boolean;
}

const timeLogSchema = new Schema<ITimeLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    schedule: {
      type: Schema.Types.ObjectId,
      ref: 'Schedule',
      default: null,
    },
    clockInTime: {
      type: Date,
      required: true,
    },
    clockOutTime: {
      type: Date,
    },
    duration: {
      type: Number, // Stored in minutes
    },
    isApprovedOverride: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const TimeLog = model<ITimeLog>('TimeLog', timeLogSchema);
