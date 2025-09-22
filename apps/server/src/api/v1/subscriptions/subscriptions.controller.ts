import { type Request, type Response } from 'express';
import { z } from 'zod';
import { Subscription } from './subscriptions.model.js';

const subscriptionSchema = z.object({
  client: z.string(),
  serviceName: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  renewalDate: z.string().datetime(),
  billingCycle: z.enum(['Monthly', 'Quarterly', 'Yearly']),
  cost: z.number().positive(),
  status: z.enum(['Active', 'Paused', 'Canceled', 'Expired']),
  paymentMethod: z.string().optional(),
  assignedTeamMember: z.string().optional(),
  notes: z.string().optional(),
});

export const getSubscriptions = async (req: Request, res: Response) => {
  try {
    const subscriptions = await Subscription.find()
      .populate('client', 'clientName')
      .populate('assignedTeamMember', 'name')
      .sort({ renewalDate: 1 });
    res.status(200).json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching subscriptions.' });
  }
};

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const data = subscriptionSchema.parse(req.body);
    const newSubscription = await Subscription.create(data);
    res.status(201).json(newSubscription);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Invalid data.', errors: error.issues });
    }
    res.status(500).json({ message: 'Server error creating subscription.' });
  }
};

export const deleteSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Subscription.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Subscription not found.' });
    }
    res.status(200).json({ message: 'Subscription deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting subscription.' });
  }
};
