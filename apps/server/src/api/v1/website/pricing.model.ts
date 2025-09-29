import { Schema, Document } from 'mongoose';
import { getPublicDb } from '../../../config/db.js';

export interface IPricingTier extends Document {
  name: string;
  price: string;
  frequency: 'monthly' | 'yearly' | 'one-time';
  features: string[];
  isFeatured: boolean;
  isActive: boolean;
}

const pricingTierSchema = new Schema<IPricingTier>({
  name: { type: String, required: true, trim: true },
  price: { type: String, required: true },
  frequency: { type: String, enum: ['monthly', 'yearly', 'one-time'], required: true },
  features: [String],
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const PricingTier = getPublicDb().model<IPricingTier>('PricingTier', pricingTierSchema);