import { Schema, model, Document } from 'mongoose';
import { UserRole } from '../auth/user.model.js'; // Assuming you want to link articles to authors and roles

// 1. Define the interface for an Article
interface IArticle extends Document {
  title: string;
  content: string;
  author: Schema.Types.ObjectId; // Reference to the User who created the article
  authorName: string; // To avoid an extra lookup on every article display
  role: UserRole; // Storing the author's role at the time of creation
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
      ref: 'User', // This creates a relationship to the User model
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

// 3. Export the model
export const Article = model<IArticle>('Article', articleSchema);
