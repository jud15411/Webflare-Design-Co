import { type Request, type Response } from 'express';
import { z } from 'zod';
import { SoftwareAsset } from './software.model.js';

// Validation schemas for requests
const createSoftwareAssetSchema = z.object({
  name: z.string().min(3),
  licenseKey: z.string().min(10),
  purchaseDate: z.string().transform((str) => new Date(str)),
  assignedTo: z.string(),
  assignedToName: z.string(),
  notes: z.string().optional(),
});

const updateSoftwareAssetSchema = z.object({
  name: z.string().min(3).optional(),
  licenseKey: z.string().min(10).optional(),
  purchaseDate: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  assignedTo: z.string().optional(),
  assignedToName: z.string().optional(),
  notes: z.string().optional(),
});

// Create a new software asset
export const createSoftwareAsset = async (req: Request, res: Response) => {
  try {
    const {
      name,
      licenseKey,
      purchaseDate,
      assignedTo,
      assignedToName,
      notes,
    } = createSoftwareAssetSchema.parse(req.body);

    const newAsset = await SoftwareAsset.create({
      name,
      licenseKey,
      purchaseDate,
      assignedTo,
      assignedToName,
      notes,
    });

    res.status(201).json({
      message: 'Software asset created successfully',
      asset: newAsset,
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

// Get all software assets
export const getSoftwareAssets = async (req: Request, res: Response) => {
  try {
    const assets = await SoftwareAsset.find().sort({ name: 1 });
    res.status(200).json(assets);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a software asset
export const updateSoftwareAsset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = updateSoftwareAssetSchema.parse(req.body);

    const updatedAsset = await SoftwareAsset.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedAsset) {
      return res.status(404).json({ message: 'Software asset not found' });
    }

    res.status(200).json({
      message: 'Software asset updated successfully',
      asset: updatedAsset,
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

// Delete a software asset
export const deleteSoftwareAsset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedAsset = await SoftwareAsset.findByIdAndDelete(id);

    if (!deletedAsset) {
      return res.status(404).json({ message: 'Software asset not found' });
    }

    res.status(200).json({ message: 'Software asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
