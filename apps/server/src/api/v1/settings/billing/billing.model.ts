import { Schema, model, Document } from 'mongoose';

export interface IBillingSettings extends Document {
  currency: string;
  taxRate: number;
  paymentProviders: string[];
}

export interface IClientPortalSettings extends Document {
  showInvoices: boolean;
  showProjects: boolean;
  showTasks: boolean; // <-- Add this line
  canUploadFiles: boolean;
  userPermissions: Record<string, 'read' | 'write'>;
}

export const BillingSettings = model<IBillingSettings>(
  'BillingSettings',
  new Schema<IBillingSettings>({
    currency: { type: String, required: true, default: 'USD' },
    taxRate: { type: Number, required: true, default: 0 },
    paymentProviders: [{ type: String }],
  })
);

export const ClientPortalSettings = model<IClientPortalSettings>(
  'ClientPortalSettings',
  new Schema<IClientPortalSettings>({
    showInvoices: { type: Boolean, default: true },
    showProjects: { type: Boolean, default: true },
    showTasks: { type: Boolean, default: true }, // <-- Add this line
    canUploadFiles: { type: Boolean, default: false },
    userPermissions: { type: Map, of: String, default: {} },
  })
);
