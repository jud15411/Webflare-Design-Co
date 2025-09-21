import { type Request, type Response } from 'express';
import { z } from 'zod';

// Define the interface for a standard agreement
interface IAgreement {
  id: number;
  title: string;
  content: string;
}

// Dummy database (in-memory)
let agreements: IAgreement[] = [
  {
    id: 1,
    title: 'Standard Service Agreement',
    content:
      'This is the standard service agreement for all web development projects...',
  },
  {
    id: 2,
    title: 'Non-Disclosure Agreement (NDA)',
    content:
      'This NDA protects confidential information shared during a project...',
  },
];
let nextId = 3;

// --- Validation Schemas ---
const agreementSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(20),
});

// --- Controller Functions ---

// Get all agreements
export const getAgreements = (req: Request, res: Response) => {
  res.status(200).json(agreements);
};

// Add a new agreement
export const addAgreement = (req: Request, res: Response) => {
  try {
    const newAgreement = agreementSchema.parse(req.body);
    const agreementWithId: IAgreement = { ...newAgreement, id: nextId++ };
    agreements.push(agreementWithId);
    res.status(201).json({
      message: 'Agreement added successfully',
      agreement: agreementWithId,
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

// Update an agreement
export const updateAgreement = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Agreement ID is required' });
    }

    const updates = agreementSchema.partial().parse(req.body);

    const agreementIndex = agreements.findIndex((a) => a.id === parseInt(id));
    if (agreementIndex === -1) {
      return res.status(404).json({ message: 'Agreement not found' });
    }

    agreements[agreementIndex] = {
      ...agreements[agreementIndex],
      ...updates,
    } as IAgreement;
    res.status(200).json({
      message: 'Agreement updated successfully',
      agreement: agreements[agreementIndex],
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

// Delete an agreement
export const deleteAgreement = (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'Agreement ID is required' });
  }

  const initialLength = agreements.length;
  agreements = agreements.filter((a) => a.id !== parseInt(id));

  if (agreements.length === initialLength) {
    return res.status(404).json({ message: 'Agreement not found' });
  }

  res.status(200).json({ message: 'Agreement deleted successfully' });
};
