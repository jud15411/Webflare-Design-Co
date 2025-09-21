import { Schema, model, Document, Types } from 'mongoose';

export interface IClockInRequest extends Document {
  user: Types.ObjectId;
  reason: string;
  status: 'Pending' | 'Approved' | 'Denied';
}

const clockInRequestSchema = new Schema<IClockInRequest>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Denied'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

export const ClockInRequest = model<IClockInRequest>(
  'ClockInRequest',
  clockInRequestSchema
);
