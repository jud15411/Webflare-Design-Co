import { Schema, model, Document } from 'mongoose';
import { UserRole } from '../auth/user.model.js';

// Define the available sections for articles
// FIX: Add 'as const' to create a readonly tuple, which z.enum requires.
export const articleSections = [
  'Onboarding',
  'General',
  'Technical',
  'Policy',
] as const;

// 1. Define the interface for an Article
interface IArticle extends Document {
  title: string;
  content: string;
  author: Schema.Types.ObjectId;
  authorName: string;
  role: Schema.Types.ObjectId; // Storing the author's role ObjectId
  status: 'Draft' | 'Published';
  section: (typeof articleSections)[number];
}

// 2. Define the Schema
const articleSchema = new Schema<IArticle>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role', // This should reference your Role model
      required: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Published',
    },
    section: {
      type: String,
      enum: [...articleSections], // Spread to satisfy mongoose enum
      required: true,
    },
  },
  { timestamps: true }
);

// 3. Export the model
export const Article = model<IArticle>('Article', articleSchema);
