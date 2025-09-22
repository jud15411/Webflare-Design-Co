import { type Request, type Response } from 'express';
import { z } from 'zod';
import { StandardAgreement } from './legal.model.js';

const agreementSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

// Legal Agreements Controller
export const getAgreements = async (req: Request, res: Response) => {
  try {
    const agreements = await StandardAgreement.find().sort({ title: 1 });
    res.status(200).json(agreements);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching agreements.' });
  }
};

export const createAgreement = async (req: Request, res: Response) => {
  try {
    const data = agreementSchema.parse(req.body);
    const newAgreement = await StandardAgreement.create(data);
    res.status(201).json(newAgreement);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Invalid data.', errors: error.issues });
    }
    res.status(500).json({ message: 'Server error creating agreement.' });
  }
};

export const deleteAgreement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedAgreement = await StandardAgreement.findByIdAndDelete(id);
    if (!deletedAgreement) {
      return res.status(404).json({ message: 'Agreement not found.' });
    }
    res.status(200).json({ message: 'Agreement deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting agreement.' });
  }
};
