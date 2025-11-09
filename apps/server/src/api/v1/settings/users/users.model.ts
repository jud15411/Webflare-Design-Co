import mongoose, { Schema, Document, Types } from 'mongoose';
import { getMainDb } from '../../../../config/db.js';

// --- Placeholder for Role Interface ---
export interface IRole {
    _id: string;
    name: string;
    description?: string;
}

// --- Main User Interface ---
export interface IUser extends Document {
    name: string;
    email: string;
    // FIX 1: 'role' is an ObjectId for the DB, but can be a populated IRole object
    role: Types.ObjectId | IRole; 
    isActive: boolean;
    bio?: string;
    location?: string;
    avatarUrl?: string | null; 
    password: string; 
}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true }, 
    
    // ✅ FIX 2: Change type to ObjectId and add a reference to the 'Role' collection
    role: { 
        type: Schema.Types.ObjectId, 
        ref: 'Role', // IMPORTANT: This must match the name of your roles collection
        required: true 
    },
    
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

// --- AUXILIARY MODELS ---

export interface IMfaSettings extends Document { enabled: boolean; requiredForRoles: string[]; }
export interface IPermissionSettings extends Document { permissions: Record<string, string[]>; }

export const MfaSettings = getMainDb().model<IMfaSettings>('MfaSettings', new Schema<IMfaSettings>({ 
    enabled: { type: Boolean, default: false }, 
    requiredForRoles: [{ type: String }] 
}));

export const PermissionSettings = getMainDb().model<IPermissionSettings>('PermissionSettings', new Schema<IPermissionSettings>({ 
    permissions: { type: Map, of: [String], default: {} } 
}));