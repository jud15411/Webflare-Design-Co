import { type Request, type Response } from 'express';
import { z } from 'zod';

// Define the interface for the billing settings
interface BillingSettings {
  currency: string;
  taxRate: number;
  paymentProviders: string[];
}

// Dummy database (in-memory)
let billingSettings: BillingSettings = {
  currency: 'USD',
  taxRate: 0.08,
  paymentProviders: ['Stripe'],
};

// --- Validation Schemas ---
const updateBillingSettingsSchema = z.object({
  currency: z.string().optional(),
  taxRate: z.number().optional(),
  paymentProviders: z.array(z.string()).optional(),
});

// --- Controller Functions ---

// Get billing settings
export const getBillingSettings = (req: Request, res: Response) => {
  res.status(200).json(billingSettings);
};

// Update billing settings
export const updateBillingSettings = (req: Request, res: Response) => {
  try {
    const updates = updateBillingSettingsSchema.parse(req.body);
    // Explicitly cast the merged object to the correct type
    billingSettings = { ...billingSettings, ...updates } as BillingSettings;
    res
      .status(200)
      .json({
        message: 'Billing settings updated successfully',
        settings: billingSettings,
      });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({
          message: 'Invalid data',
          errors: (error as z.ZodError).issues,
        });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
