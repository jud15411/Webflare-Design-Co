// server/src/roles/role.model.ts

import { Schema, model, Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  description?: string;
}

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Role = model<IRole>('Role', roleSchema);
