import { Schema, model, Document } from 'mongoose';

export interface IStandardAgreement extends Document {
  title: string;
  content: string;
}

export const StandardAgreement = model<IStandardAgreement>(
  'StandardAgreement',
  new Schema<IStandardAgreement>({
    title: { type: String, required: true },
    content: { type: String, required: true },
  })
);
