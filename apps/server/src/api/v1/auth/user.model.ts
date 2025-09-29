// server/src/auth/user.model.ts

import { Schema, model, Document, Types } from 'mongoose'; // <-- 1. Import 'Types'
import bcrypt from 'bcryptjs';
import { type IRole } from '../roles/role.model.js';
import { getMainDb } from '../../../config/db.js';

// Defines the possible user roles
export enum UserRole {
  CEO = 'ceo',
  DEVELOPER = 'developer',
  CTO = 'cto',
  SALES = 'sales',
}

// The TypeScript interface for a User document
export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: Types.ObjectId | IRole; // <-- 2. Use Types.ObjectId here
  bio?: string;
  location?: string;
  isActive: boolean;
  isClockedIn: boolean;
  activeTimeLog?: Types.ObjectId;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

// The Mongoose schema that enforces the data structure in MongoDB
// This part does not need to change. Schema.Types.ObjectId is correct here.
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: Schema.Types.ObjectId, // This remains correct for the schema definition
      ref: 'Role',
      required: true,
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isClockedIn: {
      type: Boolean,
      default: false,
    },
    activeTimeLog: {
      type: Schema.Types.ObjectId,
      ref: 'TimeLog',
      default: null,
    },
  },
  { timestamps: true }
);

// Middleware and methods remain the same...
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create and export the User model
export const User = getMainDb().model<IUser>('User', userSchema);
