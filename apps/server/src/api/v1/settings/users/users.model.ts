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
    
    role: { 
        type: Schema.Types.ObjectId, 
        ref: 'Role', 
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

// ✅ FIX: Check if the model already exists on the connection before compiling it.
const conn = getMainDb();

export const User = conn.models.User 
    ? (conn.models.User as mongoose.Model<IUser>) 
    : conn.model<IUser>('User', UserSchema);


// --- AUXILIARY MODELS (Included for completeness) ---

export interface IMfaSettings extends Document { enabled: boolean; requiredForRoles: string[]; }
export interface IPermissionSettings extends Document { permissions: Record<string, string[]>; }

export const MfaSettings = conn.models.MfaSettings 
    ? (conn.models.MfaSettings as mongoose.Model<IMfaSettings>)
    : conn.model<IMfaSettings>('MfaSettings', new Schema<IMfaSettings>({ 
        enabled: { type: Boolean, default: false }, 
        requiredForRoles: [{ type: String }] 
    }));

export const PermissionSettings = conn.models.PermissionSettings 
    ? (conn.models.PermissionSettings as mongoose.Model<IPermissionSettings>)
    : conn.model<IPermissionSettings>('PermissionSettings', new Schema<IPermissionSettings>({ 
        permissions: { type: Map, of: [String], default: {} } 
    }));