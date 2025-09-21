import { type Request, type Response } from 'express';
import { z } from 'zod';

// Define the interface for an API key
interface IApiKey {
  id: number;
  name: string;
  key: string;
  accessLevel: 'read' | 'write' | 'full';
  createdAt: string;
}

// Dummy database (in-memory)
let apiKeys: IApiKey[] = [
  {
    id: 1,
    name: 'Stripe Integration',
    key: 'sk_live_...456',
    accessLevel: 'write',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Analytics Service',
    key: 'pub_key_...789',
    accessLevel: 'read',
    createdAt: new Date().toISOString(),
  },
];
let nextId = 3;

// --- Validation Schemas ---
const apiKeySchema = z.object({
  name: z.string().min(3),
  accessLevel: z.union([
    z.literal('read'),
    z.literal('write'),
    z.literal('full'),
  ]),
});

// --- Controller Functions ---

// Get all API keys
export const getApiKeys = (req: Request, res: Response) => {
  res.status(200).json(apiKeys);
};

// Add a new API key (generating a dummy key)
export const addApiKey = (req: Request, res: Response) => {
  try {
    const { name, accessLevel } = apiKeySchema.parse(req.body);
    const newKey = `sk_dummy_${Math.random().toString(36).substring(2, 15)}`;
    const newApiKey: IApiKey = {
      id: nextId++,
      name,
      key: newKey,
      accessLevel,
      createdAt: new Date().toISOString(),
    };
    apiKeys.push(newApiKey);
    res
      .status(201)
      .json({ message: 'API key added successfully', key: newApiKey });
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

// Delete an API key
export const deleteApiKey = (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'API key ID is required' });
  }

  const initialLength = apiKeys.length;
  apiKeys = apiKeys.filter((key) => key.id !== parseInt(id));

  if (apiKeys.length === initialLength) {
    return res.status(404).json({ message: 'API key not found' });
  }

  res.status(200).json({ message: 'API key deleted successfully' });
};
