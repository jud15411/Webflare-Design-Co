import { Schema, Document } from 'mongoose';
import { getMainDb } from '../../../config/db.js';

export interface ITemplate extends Document { name: string; serviceType: 'MSA' | 'Web Development' | 'Cybersecurity'; content: string; }
const templateSchema = new Schema<ITemplate>({ name: { type: String, required: true, unique: true }, serviceType: { type: String, enum: ['MSA', 'Web Development', 'Cybersecurity'], required: true }, content: { type: String, required: true } });
export const Template = getMainDb().model<ITemplate>('Template', templateSchema);