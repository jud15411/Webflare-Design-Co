import { Schema, model, Document, Types } from 'mongoose';

// Interface for a single line item used in Proposals and Invoices
export interface ILineItem {
  description: string;
  quantity: number;
  price: number;
}

// ---- PROPOSAL ----
export interface IProposal extends Document {
  client: Types.ObjectId;
  contactPerson: string;
  projectTitle: string;
  projectOverview: string;
  goals: string;
  scopeOfWork: string;
  deliverables: string;
  startDate: Date;
  completionDate: Date;
  milestones: string;
  lineItems: ILineItem[];
  totalAmount: number;
  paymentTerms: string;
  assumptions: string;
  exclusions: string;
  legalTerms: string;
  assignedTeamMember: Types.ObjectId;
  internalStatus: 'Draft' | 'Pending Approval' | 'Approved';
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined';
}

// ---- INVOICE ----
export interface IInvoice extends Document {
  invoiceNumber: string;
  client: Types.ObjectId; // Link to Client
  project: Types.ObjectId; // Link to Project
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  lineItems: ILineItem[];
  totalAmount: number;
  issueDate: Date;
  dueDate: Date;
}

// ---- EXPENSE ----
export interface IExpense extends Document {
  category: string;
  vendor: string;
  amount: number;
  expenseDate: Date;
}

// ---- SCHEMAS ----
const lineItemSchema = new Schema<ILineItem>({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 },
});

const proposalSchema = new Schema<IProposal>(
  {
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    contactPerson: { type: String, required: true },
    projectTitle: { type: String, required: true },
    projectOverview: { type: String, required: true },
    goals: { type: String },
    scopeOfWork: { type: String, required: true },
    deliverables: { type: String },
    startDate: { type: Date, required: true },
    completionDate: { type: Date, required: true },
    milestones: { type: String },
    lineItems: [lineItemSchema],
    totalAmount: { type: Number, required: true },
    paymentTerms: { type: String },
    assumptions: { type: String },
    exclusions: { type: String },
    legalTerms: { type: String },
    assignedTeamMember: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    internalStatus: {
      type: String,
      enum: ['Draft', 'Pending Approval', 'Approved'],
      default: 'Draft',
    },
    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Accepted', 'Declined'],
      default: 'Draft',
    },
  },
  { timestamps: true }
);

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Paid', 'Overdue'],
      default: 'Draft',
    },
    lineItems: [lineItemSchema],
    totalAmount: { type: Number, required: true },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const expenseSchema = new Schema<IExpense>(
  {
    category: { type: String, required: true },
    vendor: { type: String, required: true },
    amount: { type: Number, required: true },
    expenseDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Proposal = model<IProposal>('Proposal', proposalSchema);
export const Invoice = model<IInvoice>('Invoice', invoiceSchema);
export const Expense = model<IExpense>('Expense', expenseSchema);
