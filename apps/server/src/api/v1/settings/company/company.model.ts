import { Schema, Document } from 'mongoose';
import { getMainDb } from '../../../../config/db.js';

export interface ICompanyInfo extends Document { companyName: string; address: string; contactEmail: string; }
export interface IService extends Document { name: string; price: number; description: string; }
export const CompanyInfo = getMainDb().model<ICompanyInfo>('CompanyInfo', new Schema<ICompanyInfo>({ companyName: { type: String, required: true }, address: { type: String, required: true }, contactEmail: { type: String, required: true } }));
export const Service = getMainDb().model<IService>('Service', new Schema<IService>({ name: { type: String, required: true, unique: true }, price: { type: Number, required: true }, description: { type: String, required: true } }));