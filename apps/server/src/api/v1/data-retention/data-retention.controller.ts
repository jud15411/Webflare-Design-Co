import { type Request, type Response } from 'express';
import { z } from 'zod';

// Define the shape of our placeholder data retention policy
interface IDataRetentionPolicy {
  clients: number; // in months
  projects: number; // in months
  invoices: number; // in months
  auditLogs: number; // in months
}

// Dummy database (in-memory)
let retentionPolicy: IDataRetentionPolicy = {
  clients: 24,
  projects: 60,
  invoices: 84,
  auditLogs: 12,
};

// --- Validation Schemas ---
const updatePolicySchema = z.object({
  clients: z.number().int().min(1).optional(),
  projects: z.number().int().min(1).optional(),
  invoices: z.number().int().min(1).optional(),
  auditLogs: z.number().int().min(1).optional(),
});

// --- Controller Functions ---

// Get data retention policy
export const getPolicy = (req: Request, res: Response) => {
  res.status(200).json(retentionPolicy);
};

// Update data retention policy
export const updatePolicy = (req: Request, res: Response) => {
  try {
    const updates = updatePolicySchema.parse(req.body);
    retentionPolicy = {
      ...retentionPolicy,
      ...updates,
    } as IDataRetentionPolicy;
    res.status(200).json({
      message: 'Data retention policy updated successfully',
      policy: retentionPolicy,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid data',
        errors: (error as z.ZodError).issues,
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
