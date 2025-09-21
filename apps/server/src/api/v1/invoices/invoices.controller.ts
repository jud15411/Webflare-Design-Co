import { type Request, type Response } from 'express';
import { z } from 'zod';

// Define the interface for an invoice
interface IInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  status: 'Paid' | 'Unpaid' | 'Overdue';
}

// Dummy database (in-memory)
const invoiceTemplates = ['Standard Business Invoice', 'Project-Based Invoice'];
const paymentRules = [
  'Require 50% deposit for projects over $1000',
  'Full payment due 30 days after invoice sent',
];
const invoices: IInvoice[] = [
  {
    id: 'inv_001',
    invoiceNumber: 'INV-2025-001',
    clientName: 'Alpha Corp',
    amount: 5000,
    status: 'Unpaid',
  },
  {
    id: 'inv_002',
    invoiceNumber: 'INV-2025-002',
    clientName: 'Beta Solutions',
    amount: 1500,
    status: 'Paid',
  },
];

// Validation schemas
const paymentRuleSchema = z.string().min(10);

// --- Controller Functions ---

// Get invoice and payment settings
export const getInvoicePaymentSettings = (req: Request, res: Response) => {
  res.status(200).json({
    templates: invoiceTemplates,
    rules: paymentRules,
  });
};

// Add a payment rule (placeholder)
export const addPaymentRule = (req: Request, res: Response) => {
  try {
    const newRule = paymentRuleSchema.parse(req.body.rule);
    paymentRules.push(newRule);
    res.status(201).json({ message: 'Payment rule added successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Invalid data', errors: error.issues });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recent invoices (placeholder)
export const getRecentInvoices = (req: Request, res: Response) => {
  res.status(200).json(invoices);
};
