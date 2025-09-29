import { Schema, Document, Types } from 'mongoose';
import { getMainDb } from '../../../config/db.js';

export interface ITimeLog extends Document { user: Types.ObjectId; schedule?: Types.ObjectId; clockInTime: Date; clockOutTime?: Date; duration?: number; isApprovedOverride: boolean; }
const timeLogSchema = new Schema<ITimeLog>({ user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }, schedule: { type: Schema.Types.ObjectId, ref: 'Schedule', default: null }, clockInTime: { type: Date, required: true }, clockOutTime: { type: Date }, duration: { type: Number }, isApprovedOverride: { type: Boolean, default: false } }, { timestamps: true });
export const TimeLog = getMainDb().model<ITimeLog>('TimeLog', timeLogSchema);