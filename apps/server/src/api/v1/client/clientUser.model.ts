import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

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
    password: { type: String },
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    portalAccessGranted: { type: Boolean, default: false },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

clientUserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

clientUserSchema.methods.comparePassword = async function (
  enteredPassword: string
) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export const ClientUser = model<IClientUser>('ClientUser', clientUserSchema);
