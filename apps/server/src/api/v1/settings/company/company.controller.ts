import { type Request, type Response } from 'express';
import { z } from 'zod';
import { CompanyInfo, Service } from './company.model.js';

// Schemas
const companyInfoSchema = z.object({
  companyName: z.string().min(1),
  address: z.string().min(1),
  contactEmail: z.string().email(),
});

const serviceSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  description: z.string().min(1),
});

// Company Info Controller
// A "singleton" document, upserting if it doesn't exist
export const getCompanyInfo = async (req: Request, res: Response) => {
  try {
    const info = await CompanyInfo.findOne();
    res.status(200).json(info || {});
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching company info.' });
  }
};

export const updateCompanyInfo = async (req: Request, res: Response) => {
  try {
    const data = companyInfoSchema.parse(req.body);
    const updatedInfo = await CompanyInfo.findOneAndUpdate({}, data, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });
    res.status(200).json(updatedInfo);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Invalid data.', errors: error.issues });
    }
    res.status(500).json({ message: 'Server error updating company info.' });
  }
};

// Services Controller
export const getServices = async (req: Request, res: Response) => {
  try {
    const services = await Service.find().sort({ name: 1 });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching services.' });
  }
};

export const createService = async (req: Request, res: Response) => {
  try {
    const data = serviceSchema.parse(req.body);
    const newService = await Service.create(data);
    res.status(201).json(newService);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Invalid data.', errors: error.issues });
    }
    res.status(500).json({ message: 'Server error creating service.' });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedService = await Service.findByIdAndDelete(id);
    if (!deletedService) {
      return res.status(404).json({ message: 'Service not found.' });
    }
    res.status(200).json({ message: 'Service deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting service.' });
  }
};
