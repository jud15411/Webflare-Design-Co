import { Schema, Document } from 'mongoose';
import { getMainDb } from '../../../../config/db.js';

// --- INFERRED USER TYPES AND SCHEMA ---

export interface IUser extends Document {
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    bio?: string;
    location?: string;
    avatarUrl?: string | null; 
    // FIX: Added 'password' to the interface to satisfy the schema definition
    password: string; 
}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    // This now matches the IUser interface
    password: { type: String, required: true }, 
    role: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    avatarUrl: {
        type: String,
        default: null,
        trim: true,
    },
}, { timestamps: true });

export const User = getMainDb().model<IUser>('User', UserSchema);

// --- ORIGINAL AUXILIARY MODELS ---

export interface IMfaSettings extends Document { enabled: boolean; requiredForRoles: string[]; }
export interface IPermissionSettings extends Document { permissions: Record<string, string[]>; }

export const MfaSettings = getMainDb().model<IMfaSettings>('MfaSettings', new Schema<IMfaSettings>({ 
    enabled: { type: Boolean, default: false }, 
    requiredForRoles: [{ type: String }] 
}));

export const PermissionSettings = getMainDb().model<IPermissionSettings>('PermissionSettings', new Schema<IPermissionSettings>({ 
    permissions: { type: Map, of: [String], default: {} } 
}));