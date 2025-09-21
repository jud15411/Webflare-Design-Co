import { type Request, type Response } from 'express';
import { z } from 'zod';

// Define the interface for a service
interface IService {
  id: number;
  name: string;
  price: number;
  description: string;
}

// Validation schemas for requests
const serviceSchema = z.object({
  name: z.string().min(3),
  price: z.number().positive(),
  description: z.string().min(10),
});

// Dummy database (in-memory)
let services: IService[] = [
  {
    id: 1,
    name: 'Web Development',
    price: 5000,
    description: 'Complete custom website design and development.',
  },
  {
    id: 2,
    name: 'Cybersecurity Audit',
    price: 2500,
    description: 'Comprehensive security audit and vulnerability assessment.',
  },
];
let nextId = 3;

// Get all services
export const getServices = (req: Request, res: Response) => {
  res.status(200).json(services);
};

// Add a new service
export const addService = (req: Request, res: Response) => {
  try {
    const newService = serviceSchema.parse(req.body);
    const serviceWithId: IService = { ...newService, id: nextId++ };
    services.push(serviceWithId);
    res
      .status(201)
      .json({ message: 'Service added successfully', service: serviceWithId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Invalid data', errors: error.issues });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a service
export const updateService = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Check if id is provided
    if (!id) {
      return res.status(400).json({ message: 'Service ID is required' });
    }

    const serviceUpdates = serviceSchema.partial().parse(req.body);

    const serviceIndex = services.findIndex((s) => s.id === parseInt(id));
    if (serviceIndex === -1) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Explicitly cast the merged object to IService
    services[serviceIndex] = {
      ...services[serviceIndex],
      ...serviceUpdates,
    } as IService;
    res
      .status(200)
      .json({
        message: 'Service updated successfully',
        service: services[serviceIndex],
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

// Delete a service
export const deleteService = (req: Request, res: Response) => {
  const { id } = req.params;
  // Check if id is provided
  if (!id) {
    return res.status(400).json({ message: 'Service ID is required' });
  }

  const initialLength = services.length;
  services = services.filter((s) => s.id !== parseInt(id));

  if (services.length === initialLength) {
    return res.status(404).json({ message: 'Service not found' });
  }

  res.status(200).json({ message: 'Service deleted successfully' });
};
