import { type Request, type Response } from 'express';
import { z } from 'zod';
import { UserRole } from '../settings/users/users.model.js';

// Define the available features for which permissions can be set
const features = [
  'dashboard',
  'knowledge-base',
  'software-management',
  'reports',
  'settings',
];
type Feature = (typeof features)[number];

// Define the shape of our placeholder permissions
interface IPermissions {
  [role: string]: Feature[];
}

// Dummy database (in-memory)
let permissions: IPermissions = {
  [UserRole.CEO]: [
    'dashboard',
    'knowledge-base',
    'software-management',
    'reports',
    'settings',
  ],
  [UserRole.CTO]: [
    'dashboard',
    'knowledge-base',
    'software-management',
    'reports',
  ],
  [UserRole.DEVELOPER]: ['dashboard', 'knowledge-base'],
  [UserRole.SALES]: ['dashboard', 'knowledge-base', 'reports'],
};

// --- Validation Schemas ---
const updatePermissionsSchema = z.record(
  z.nativeEnum(UserRole),
  z.array(z.string())
);

// --- Controller Functions ---

// Get all permissions
export const getPermissions = (req: Request, res: Response) => {
  res.status(200).json(permissions);
};

// Update permissions for a role
export const updatePermissions = (req: Request, res: Response) => {
  try {
    const updates = updatePermissionsSchema.parse(req.body);
    permissions = { ...permissions, ...updates };
    res
      .status(200)
      .json({ message: 'Permissions updated successfully', permissions });
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