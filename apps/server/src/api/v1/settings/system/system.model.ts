import { Schema, Document } from 'mongoose';
import { getMainDb } from '../../../../config/db.js';

export interface IApiKey extends Document { name: string; key: string; accessLevel: 'read' | 'write' | 'full'; }
export interface IAuditLog extends Document { timestamp: Date; user: string; action: string; details: string; }
export interface IDataRetentionPolicy extends Document { clients: number; projects: number; invoices: number; auditLogs: number; }
export interface IBackupPoint extends Document { timestamp: Date; sizeMB: number; type: 'manual' | 'automatic'; }
export const ApiKey = getMainDb().model<IApiKey>('ApiKey', new Schema<IApiKey>({ name: { type: String, required: true }, key: { type: String, required: true, unique: true }, accessLevel: { type: String, enum: ['read', 'write', 'full'], default: 'read' } }, { timestamps: true }));
export const AuditLog = getMainDb().model<IAuditLog>('AuditLog', new Schema<IAuditLog>({ timestamp: { type: Date, default: Date.now }, user: { type: String, required: true }, action: { type: String, required: true }, details: { type: String } }));
export const DataRetentionPolicy = getMainDb().model<IDataRetentionPolicy>('DataRetentionPolicy', new Schema<IDataRetentionPolicy>({ clients: { type: Number, default: 0 }, projects: { type: Number, default: 0 }, invoices: { type: Number, default: 0 }, auditLogs: { type: Number, default: 0 } }));
export const BackupPoint = getMainDb().model<IBackupPoint>('BackupPoint', new Schema<IBackupPoint>({ timestamp: { type: Date, default: Date.now }, sizeMB: { type: Number, default: 0 }, type: { type: String, enum: ['manual', 'automatic'], default: 'manual' } }, { timestamps: true }));