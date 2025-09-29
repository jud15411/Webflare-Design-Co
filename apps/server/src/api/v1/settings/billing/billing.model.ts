import { Schema, Document } from 'mongoose';
import { getMainDb } from '../../../../config/db.js';

export interface IBillingSettings extends Document { currency: string; taxRate: number; paymentProviders: string[]; }
export interface IClientPortalSettings extends Document { showInvoices: boolean; showProjects: boolean; showTasks: boolean; canUploadFiles: boolean; userPermissions: Record<string, 'read' | 'write'>; }
export const BillingSettings = getMainDb().model<IBillingSettings>('BillingSettings', new Schema<IBillingSettings>({ currency: { type: String, required: true, default: 'USD' }, taxRate: { type: Number, required: true, default: 0 }, paymentProviders: [{ type: String }] }));
export const ClientPortalSettings = getMainDb().model<IClientPortalSettings>('ClientPortalSettings', new Schema<IClientPortalSettings>({ showInvoices: { type: Boolean, default: true }, showProjects: { type: Boolean, default: true }, showTasks: { type: Boolean, default: true }, canUploadFiles: { type: Boolean, default: false }, userPermissions: { type: Map, of: String, default: {} } }));