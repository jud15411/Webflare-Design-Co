import { Schema, Document, Types } from 'mongoose';
import { getMainDb } from '../../../config/db.js';

export interface ISchedule extends Document { user: Types.ObjectId; startTime: Date; endTime: Date; status: 'Draft' | 'Published'; notes?: string; }
const scheduleSchema = new Schema<ISchedule>({ user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }, startTime: { type: Date, required: true }, endTime: { type: Date, required: true }, status: { type: String, enum: ['Draft', 'Published'], default: 'Draft' }, notes: { type: String, trim: true } }, { timestamps: true });
export const Schedule = getMainDb().model<ISchedule>('Schedule', scheduleSchema);