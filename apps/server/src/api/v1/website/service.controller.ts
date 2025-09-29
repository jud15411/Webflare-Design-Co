import { type Request, type Response } from 'express';
import { Service } from './service.model.js';

// Get all services for the admin panel
export const getServices = async (req: Request, res: Response) => {
  const services = await Service.find();
  res.status(200).json(services);
};

// Create a new service
export const createService = async (req: Request, res: Response) => {
  const { name, description, icon } = req.body;
  const newService = await Service.create({ name, description, icon });
  res.status(201).json(newService);
};

// Update a service
export const updateService = async (req: Request, res: Response) => {
  const updatedService = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!updatedService) {
    return res.status(404).json({ message: 'Service not found.' });
  }
  res.status(200).json(updatedService);
};

// Delete a service
export const deleteService = async (req: Request, res: Response) => {
  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) {
    return res.status(404).json({ message: 'Service not found' });
  }
  res.status(200).json({ message: 'Service deleted successfully.' });
};

// Get all active services for the public website
export const getPublicServices = async (req: Request, res: Response) => {
    const services = await Service.find({ isActive: true });
    res.status(200).json(services);
};