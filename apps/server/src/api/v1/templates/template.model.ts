import { Schema, model, Document } from 'mongoose';

export interface ITemplate extends Document {
  name: string; // e.g., "Master Services Agreement"
  serviceType: 'MSA' | 'Web Development' | 'Cybersecurity';
  content: string; // The full HTML/text content of the template
}

const templateSchema = new Schema<ITemplate>({
  name: { type: String, required: true, unique: true },
  serviceType: {
    type: String,
    enum: ['MSA', 'Web Development', 'Cybersecurity'],
    required: true,
  },
  content: { type: String, required: true },
});

export const Template = model<ITemplate>('Template', templateSchema);
