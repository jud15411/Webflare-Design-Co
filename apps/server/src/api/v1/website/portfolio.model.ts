import { Schema, Document } from 'mongoose';
import { getPublicDb } from '../../../config/db.js';

export interface IPortfolioItem extends Document {
  title: string;
  description: string;
  imageUrl: string;
  projectUrl?: string;
  category: 'Web Development' | 'Cybersecurity' | 'Consulting';
  isActive: boolean;
}

const portfolioItemSchema = new Schema<IPortfolioItem>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  projectUrl: { type: String },
  category: { type: String, enum: ['Web Development', 'Cybersecurity', 'Consulting'], required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const PortfolioItem = getPublicDb().model<IPortfolioItem>('PortfolioItem', portfolioItemSchema);