import { type Request, type Response } from 'express';
import { z } from 'zod';

// Define the shape of our placeholder settings
interface IClientPortalSettings {
  showInvoices: boolean;
  showProjects: boolean;
  canUploadFiles: boolean;
  userPermissions: Record<string, 'read' | 'write'>;
}

// Dummy database (in-memory)
let clientPortalSettings: IClientPortalSettings = {
  showInvoices: true,
  showProjects: true,
  canUploadFiles: false,
  userPermissions: {
    'client-admin': 'write',
    'client-user': 'read',
  },
};

// --- Validation Schemas ---
const updateSettingsSchema = z.object({
  showInvoices: z.boolean().optional(),
  showProjects: z.boolean().optional(),
  canUploadFiles: z.boolean().optional(),
  userPermissions: z
    .record(z.string(), z.union([z.literal('read'), z.literal('write')]))
    .optional(),
});

// --- Controller Functions ---

// Get all client portal settings
export const getPortalSettings = (req: Request, res: Response) => {
  res.status(200).json(clientPortalSettings);
};

// Update client portal settings
export const updatePortalSettings = (req: Request, res: Response) => {
  try {
    const updates = updateSettingsSchema.parse(req.body);
    // Explicitly cast the merged object to the correct type to resolve the error
    clientPortalSettings = {
      ...clientPortalSettings,
      ...updates,
    } as IClientPortalSettings;
    res.status(200).json({
      message: 'Client portal settings updated successfully',
      settings: clientPortalSettings,
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
