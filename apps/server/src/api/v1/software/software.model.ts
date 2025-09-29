import { Schema, Document } from 'mongoose';
import { getMainDb } from '../../../config/db.js';

export interface ISoftwareAsset extends Document { name: string; licenseKey: string; purchaseDate: Date; assignedTo: Schema.Types.ObjectId; assignedToName: string; notes?: string; }
const softwareAssetSchema = new Schema<ISoftwareAsset>({ name: { type: String, required: true, trim: true }, licenseKey: { type: String, required: true, unique: true }, purchaseDate: { type: Date, required: true }, assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true }, assignedToName: { type: String, required: true }, notes: { type: String, required: false } }, { timestamps: true });
export const SoftwareAsset = getMainDb().model<ISoftwareAsset>('SoftwareAsset', softwareAssetSchema);