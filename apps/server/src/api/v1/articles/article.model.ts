import { Schema, Document } from 'mongoose';
import { getMainDb } from '../../../config/db.js';

export const articleSections = ['Onboarding', 'General', 'Technical', 'Policy'] as const;
interface IArticle extends Document { title: string; content: string; author: Schema.Types.ObjectId; authorName: string; role: Schema.Types.ObjectId; status: 'Draft' | 'Published'; section: (typeof articleSections)[number]; }
const articleSchema = new Schema<IArticle>({ title: { type: String, required: true, trim: true }, content: { type: String, required: true }, author: { type: Schema.Types.ObjectId, ref: 'User', required: true }, authorName: { type: String, required: true }, role: { type: Schema.Types.ObjectId, ref: 'Role', required: true }, status: { type: String, enum: ['Draft', 'Published'], default: 'Published' }, section: { type: String, enum: [...articleSections], required: true } }, { timestamps: true });
export const Article = getMainDb().model<IArticle>('Article', articleSchema);