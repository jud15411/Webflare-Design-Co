import { Schema, model, Document, Types } from 'mongoose';

export interface ISubscription extends Document {
  client: Types.ObjectId;
  serviceName: string;
  description: string;
  startDate: Date;
  renewalDate: Date;
  billingCycle: 'Monthly' | 'Quarterly' | 'Yearly';
  cost: number;
  status: 'Active' | 'Paused' | 'Canceled' | 'Expired';
  paymentMethod: string;
  assignedTeamMember: Types.ObjectId;
  notes: string;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    serviceName: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true, default: Date.now },
    renewalDate: { type: Date, required: true },
    billingCycle: {
      type: String,
      enum: ['Monthly', 'Quarterly', 'Yearly'],
      required: true,
    },
    cost: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Active', 'Paused', 'Canceled', 'Expired'],
      default: 'Active',
    },
    paymentMethod: { type: String, default: 'Manual' },
    assignedTeamMember: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Subscription = model<ISubscription>(
  'Subscription',
  subscriptionSchema
);
