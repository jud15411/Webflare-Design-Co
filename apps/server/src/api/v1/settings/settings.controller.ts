import { type Request, type Response } from 'express';
import { z } from 'zod';
import { type AuthRequest } from '../../middleware/auth.middleware.js';
import { UserRole } from './users/users.model.js';

// Define schemas for validating incoming data
const companyInfoSchema = z.object({
  companyName: z.string().min(3),
  address: z.string().min(5),
  contactEmail: z.string().email(),
});

const servicesSchema = z.array(
  z.object({
    name: z.string(),
    price: z.number(),
  })
);

const userRoleSchema = z.object({
  userId: z.string(),
  newRole: z.nativeEnum(UserRole),
});

// A dummy database for now, as requested
let companyInfo = {
  companyName: 'Webflare Design Co.',
  address: '123 Main Street, Anytown, USA',
  contactEmail: 'contact@webflare.co',
};

// --- CEO Settings Functions ---

// Get company information
export const getCompanyInfo = (req: Request, res: Response) => {
  res.status(200).json(companyInfo);
};

// Update company information
export const updateCompanyInfo = (req: Request, res: Response) => {
  try {
    const { companyName, address, contactEmail } = companyInfoSchema.parse(
      req.body
    );
    companyInfo = { companyName, address, contactEmail };
    res.status(200).json({
      message: 'Company information updated successfully',
      data: companyInfo,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Invalid data', errors: error.issues });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Add/remove services (placeholder)
export const manageServices = (req: Request, res: Response) => {
  // Logic to add/remove services will go here
  res
    .status(200)
    .json({ message: 'Services managed successfully (placeholder)' });
};

// Update user role (placeholder)
export const updateUserRole = (req: Request, res: Response) => {
  try {
    const { userId, newRole } = userRoleSchema.parse(req.body);
    // Logic to update user role will go here
    res.status(200).json({
      message: `Role for user ${userId} updated to ${newRole} (placeholder)`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Invalid data', errors: error.issues });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
