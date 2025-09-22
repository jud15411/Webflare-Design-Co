import { Schema, model, Document } from 'mongoose';

export interface IMfaSettings extends Document {
  enabled: boolean;
  requiredForRoles: string[];
}

export interface IPermissionSettings extends Document {
  permissions: Record<string, string[]>;
}

export const MfaSettings = model<IMfaSettings>(
  'MfaSettings',
  new Schema<IMfaSettings>({
    enabled: { type: Boolean, default: false },
    requiredForRoles: [{ type: String }],
  })
);

export const PermissionSettings = model<IPermissionSettings>(
  'PermissionSettings',
  new Schema<IPermissionSettings>({
    permissions: { type: Map, of: [String], default: {} },
  })
);
