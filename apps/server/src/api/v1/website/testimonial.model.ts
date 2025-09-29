import { Schema, Document } from 'mongoose';
import { getPublicDb } from '../../../config/db.js';

export interface ITestimonial extends Document {
  authorName: string;
  authorCompany: string;
  quote: string;
  imageUrl?: string;
  isActive: boolean;
}

const testimonialSchema = new Schema<ITestimonial>({
  authorName: { type: String, required: true, trim: true },
  authorCompany: { type: String, required: true, trim: true },
  quote: { type: String, required: true },
  imageUrl: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Testimonial = getPublicDb().model<ITestimonial>('Testimonial', testimonialSchema);