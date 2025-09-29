import { type Request, type Response } from 'express';
import { Service } from './service.model.js';
import { PortfolioItem } from './portfolio.model.js';
import { PricingTier } from './pricing.model.js';
import { Testimonial } from './testimonial.model.js';

// Generic CRUD factory for simplicity
const createCrudController = (Model: any) => ({
  getAll: async (req: Request, res: Response) => {
    try {
      const items = await Model.find({}).sort({ createdAt: -1 });
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: `Server error fetching items.` });
    }
  },
  create: async (req: Request, res: Response) => {
    try {
      const newItem = await Model.create(req.body);
      res.status(201).json(newItem);
    } catch (error) {
      res.status(500).json({ message: `Server error creating item.` });
    }
  },
  update: async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedItem = await Model.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating item.' });
    }
  },
  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deletedItem = await Model.findByIdAndDelete(id);
      if (!deletedItem) {
        return res.status(404).json({ message: 'Item not found.' });
      }
      res.status(200).json({ message: 'Item deleted successfully.' });
    } catch (error) {
      res.status(500).json({ message: `Server error deleting item.` });
    }
  },
   getPublic: async (req: Request, res: Response) => {
    try {
      const items = await Model.find({ isActive: true }).sort({ createdAt: -1 });
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching public items.' });
    }
  },
});


export const servicesController = createCrudController(Service);
export const portfolioController = createCrudController(PortfolioItem);
export const pricingController = createCrudController(PricingTier);
export const testimonialsController = createCrudController(Testimonial);