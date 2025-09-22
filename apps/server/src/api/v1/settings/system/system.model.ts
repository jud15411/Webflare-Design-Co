import { Schema, model, Document } from 'mongoose';

// Defines the schema for an API key
export interface IApiKey extends Document {
  name: string;
  key: string;
  accessLevel: 'read' | 'write' | 'full';
}

// Defines the schema for a single audit log entry
export interface IAuditLog extends Document {
  timestamp: Date;
  user: string;
  action: string;
  details: string;
}

// Defines the schema for a data retention policy
export interface IDataRetentionPolicy extends Document {
  clients: number;
  projects: number;
  invoices: number;
  auditLogs: number;
}

// Defines the schema for a backup point
export interface IBackupPoint extends Document {
  timestamp: Date;
  sizeMB: number;
  type: 'manual' | 'automatic';
}

export const ApiKey = model<IApiKey>(
  'ApiKey',
  new Schema<IApiKey>(
    {
      name: { type: String, required: true },
      key: { type: String, required: true, unique: true },
      accessLevel: {
        type: String,
        enum: ['read', 'write', 'full'],
        default: 'read',
      },
    },
    { timestamps: true }
  )
);

export const AuditLog = model<IAuditLog>(
  'AuditLog',
  new Schema<IAuditLog>({
    timestamp: { type: Date, default: Date.now },
    user: { type: String, required: true },
    action: { type: String, required: true },
    details: { type: String },
  })
);

export const DataRetentionPolicy = model<IDataRetentionPolicy>(
  'DataRetentionPolicy',
  new Schema<IDataRetentionPolicy>({
    clients: { type: Number, default: 0 },
    projects: { type: Number, default: 0 },
    invoices: { type: Number, default: 0 },
    auditLogs: { type: Number, default: 0 },
  })
);

export const BackupPoint = model<IBackupPoint>(
  'BackupPoint',
  new Schema<IBackupPoint>(
    {
      timestamp: { type: Date, default: Date.now },
      sizeMB: { type: Number, default: 0 },
      type: { type: String, enum: ['manual', 'automatic'], default: 'manual' },
    },
    { timestamps: true }
  )
);
