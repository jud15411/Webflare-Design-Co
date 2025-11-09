import { type Request, type Response } from 'express';
import { z } from 'zod';
import { UserRole } from '../settings/users/users.model.js';

// Define the shape of our placeholder MFA settings
interface IMfaSettings {
  enabled: boolean;
  requiredForRoles: UserRole[];
  // You could add other settings here, like 'allowBackupCodes'
}

// Dummy database (in-memory)
let mfaSettings: IMfaSettings = {
  enabled: true,
  requiredForRoles: [UserRole.CEO, UserRole.CTO],
};

// --- Validation Schemas ---
const updateMfaSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  requiredForRoles: z.array(z.nativeEnum(UserRole)).optional(),
});

// --- Controller Functions ---

// Get MFA settings
export const getMfaSettings = (req: Request, res: Response) => {
  res.status(200).json(mfaSettings);
};

// Update MFA settings
export const updateMfaSettings = (req: Request, res: Response) => {
  try {
    const updates = updateMfaSettingsSchema.parse(req.body);
    mfaSettings = { ...mfaSettings, ...updates } as IMfaSettings;
    res
      .status(200)
      .json({
        message: 'MFA settings updated successfully',
        settings: mfaSettings,
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
