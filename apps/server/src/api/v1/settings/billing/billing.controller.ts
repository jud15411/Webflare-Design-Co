import { type Request, type Response } from 'express';
import { z } from 'zod';
import { BillingSettings, ClientPortalSettings } from './billing.model.js';

// Schemas
const billingSettingsSchema = z.object({
  currency: z.string().min(1),
  taxRate: z.number().min(0),
  paymentProviders: z.array(z.string()).optional(),
});

const clientPortalSettingsSchema = z.object({
  showInvoices: z.boolean().optional(),
  showProjects: z.boolean().optional(),
  canUploadFiles: z.boolean().optional(),
  userPermissions: z.record(z.string(), z.enum(['read', 'write'])).optional(),
});

// Billing Settings Controller
export const getBillingSettings = async (req: Request, res: Response) => {
  try {
    const settings = await BillingSettings.findOne();
    res.status(200).json(settings || {});
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Server error fetching billing settings.' });
  }
};

export const updateBillingSettings = async (req: Request, res: Response) => {
  try {
    const data = billingSettingsSchema.parse(req.body);
    const updatedSettings = await BillingSettings.findOneAndUpdate({}, data, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });
    res.status(200).json(updatedSettings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Invalid data.', errors: error.issues });
    }
    res
      .status(500)
      .json({ message: 'Server error updating billing settings.' });
  }
};

// Client Portal Controller
export const getClientPortalSettings = async (req: Request, res: Response) => {
  try {
    const settings = await ClientPortalSettings.findOne();
    res.status(200).json(settings || {});
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Server error fetching client portal settings.' });
  }
};

export const updateClientPortalSettings = async (
  req: Request,
  res: Response
) => {
  try {
    const data = clientPortalSettingsSchema.parse(req.body);
    const updatedSettings = await ClientPortalSettings.findOneAndUpdate(
      {},
      data,
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );
    res.status(200).json(updatedSettings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Invalid data.', errors: error.issues });
    }
    res
      .status(500)
      .json({ message: 'Server error updating client portal settings.' });
  }
};

// Placeholder for Invoice rules and recent invoices
export const getInvoiceSettings = async (req: Request, res: Response) => {
  res.status(200).json({ templates: ['Standard', 'Pro'], rules: [] });
};

export const getRecentInvoices = async (req: Request, res: Response) => {
  res.status(200).json([]);
};
