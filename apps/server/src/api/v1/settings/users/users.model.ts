import mongoose, { Schema, Document, Types } from 'mongoose';
import { getMainDb } from '../../../../config/db.js';
import bcrypt from 'bcryptjs'; // ✅ Needed for password hashing and comparison

// --- 1. UserRole Enum (Fixes: Module '"../settings/users/users.model.js"' has no exported member 'UserRole') ---
export enum UserRole {
  CEO = 'ceo',
  DEVELOPER = 'developer',
  CTO = 'cto',
  SALES = 'sales',
}

// --- Placeholder for Role Interface ---
export interface IRole {
    _id: string;
    name: string;
    description?: string;
}

// --- 2. Main User Interface (Fixes: comparePassword, isClockedIn, activeTimeLog errors) ---
export interface IUser extends Document {
    name: string;
    email: string;
    password: string; // Keep this as a typed property
    role: Types.ObjectId | IRole; 
    isActive: boolean;
    bio?: string;
    location?: string;
    avatarUrl?: string | null;

    // ✅ FIX for timelog controller errors
    isClockedIn: boolean; 
    activeTimeLog?: Types.ObjectId;

    // ✅ FIX for comparePassword errors in auth/user controllers (Method signature)
    comparePassword(enteredPassword: string): Promise<boolean>; 
}

// --- 3. User Schema Definition ---
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
    
    // ✅ FIX for timelog controller errors (Schema fields)
    isClockedIn: { 
        type: Boolean, 
        default: false 
    },
    activeTimeLog: { 
        type: Schema.Types.ObjectId, 
        ref: 'TimeLog', 
        default: null 
    },
    
}, { timestamps: true });


// --- 4. Mongoose Middleware and Methods (Fixes: comparePassword implementation) ---

// Pre-save middleware for password hashing (runs before saving to the DB)
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method for comparing passwords
UserSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  // @ts-ignore: Mongoose instance methods can access 'this.password'
  return await bcrypt.compare(enteredPassword, this.password);
};


// --- Model Compilation (Prevents OverwriteModelError) ---
const conn = getMainDb();

// ✅ CRITICAL: Check if the model already exists on the connection before compiling it.
export const User = conn.models.User 
    ? (conn.models.User as mongoose.Model<IUser>) 
    : conn.model<IUser>('User', UserSchema);


// --- AUXILIARY MODELS (Included for completeness and stability) ---

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