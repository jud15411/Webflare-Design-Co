import { Schema, Document } from 'mongoose';
import { getMainDb } from '../../../config/db.js';

export interface IRole extends Document {
  name: string;
  description?: string;
}
const roleSchema = new Schema<IRole>({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, trim: true },
}, { timestamps: true });

export const Role = getMainDb().model<IRole>('Role', roleSchema);