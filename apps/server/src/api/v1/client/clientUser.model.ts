import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { getMainDb } from '../../../config/db.js';

export interface IClientUser extends Document {
  email: string;
  password?: string;
  client: Types.ObjectId;
  portalAccessGranted: boolean;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

const clientUserSchema = new Schema<IClientUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, select: false }, // Do not return password by default
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true, unique: true }, // Ensure one user per client
    portalAccessGranted: { type: Boolean, default: false },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

// Encrypt password before saving
clientUserSchema.pre('save', async function (next) {
  // Only hash if the password field is modified (or new) AND not empty
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with the hashed password
clientUserSchema.methods.comparePassword = async function (
  enteredPassword: string
) {
  // Check if password exists (it might be undefined if access was revoked or user was just created)
  if (!this.password) {
      return false; 
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

// Index on client ID for fast lookups
clientUserSchema.index({ client: 1 });

const ClientUser = getMainDb().model<IClientUser>('ClientUser', clientUserSchema);

export { ClientUser };