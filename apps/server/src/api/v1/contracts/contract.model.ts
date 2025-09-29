import { Schema, Document, Types } from 'mongoose';
import { getMainDb } from '../../../config/db.js';

export enum ContractStatus { DRAFT = 'Draft', SENT = 'Sent', SIGNED = 'Signed', COMPLETED = 'Completed' }
export interface IContract extends Document { client: Types.ObjectId; serviceType: ('Web Development' | 'Cybersecurity')[]; status: ContractStatus; version: number; contractData: Map<string, string>; generatedPDF: string; }
const contractSchema = new Schema<IContract>({ client: { type: Schema.Types.ObjectId, ref: 'Client', required: true }, serviceType: [{ type: String, enum: ['Web Development', 'Cybersecurity'], required: true }], status: { type: String, enum: Object.values(ContractStatus), default: ContractStatus.DRAFT }, version: { type: Number, default: 1 }, contractData: { type: Map, of: String, required: true }, generatedPDF: { type: String } }, { timestamps: true });
export const Contract = getMainDb().model<IContract>('Contract', contractSchema);