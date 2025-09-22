import { type Request, type Response } from 'express';
import { z } from 'zod';
import { MfaSettings, PermissionSettings } from './users.model.js';

// Schemas
const mfaSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  requiredForRoles: z.array(z.string()).optional(),
});

const permissionSettingsSchema = z.object({
  permissions: z.record(z.string(), z.array(z.string())).optional(),
});

// MFA Settings Controller
export const getMfaSettings = async (req: Request, res: Response) => {
  try {
    const settings = await MfaSettings.findOne();
    res.status(200).json(settings || {});
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching MFA settings.' });
  }
};

export const updateMfaSettings = async (req: Request, res: Response) => {
  try {
    const data = mfaSettingsSchema.parse(req.body);
    const updatedSettings = await MfaSettings.findOneAndUpdate({}, data, {
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
    res.status(500).json({ message: 'Server error updating MFA settings.' });
  }
};

// Role-Based Permissions Controller
export const getPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await PermissionSettings.findOne();
    res.status(200).json(permissions?.permissions || {});
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching permissions.' });
  }
};

export const updatePermissions = async (req: Request, res: Response) => {
  try {
    const { permissions } = permissionSettingsSchema.parse(req.body);
    const updatedPermissions = await PermissionSettings.findOneAndUpdate(
      {},
      { permissions },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );
    res.status(200).json(updatedPermissions?.permissions);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Invalid data.', errors: error.issues });
    }
    res.status(500).json({ message: 'Server error updating permissions.' });
  }
};
