import { Schema, model, Document } from 'mongoose';

// Defines the schema for general company information
export interface ICompanyInfo extends Document {
  companyName: string;
  address: string;
  contactEmail: string;
}

// Defines the schema for a company's service
export interface IService extends Document {
  name: string;
  price: number;
  description: string;
}

export const CompanyInfo = model<ICompanyInfo>(
  'CompanyInfo',
  new Schema<ICompanyInfo>({
    companyName: { type: String, required: true },
    address: { type: String, required: true },
    contactEmail: { type: String, required: true },
  })
);

export const Service = model<IService>(
  'Service',
  new Schema<IService>({
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
  })
);
