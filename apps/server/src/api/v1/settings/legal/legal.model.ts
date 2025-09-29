import { Schema, Document } from 'mongoose';
import { getMainDb } from '../../../../config/db.js';

export interface IStandardAgreement extends Document { title: string; content: string; }
export const StandardAgreement = getMainDb().model<IStandardAgreement>('StandardAgreement', new Schema<IStandardAgreement>({ title: { type: String, required: true }, content: { type: String, required: true } }));