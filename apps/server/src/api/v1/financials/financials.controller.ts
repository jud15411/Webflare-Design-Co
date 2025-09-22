import { type Request, type Response } from 'express';
import { z } from 'zod';
import { Proposal, Invoice, Expense } from './financials.model.js';
import { Client } from '../client/client.model.js';
import { Project } from '../projects/project.model.js';

// ---- ZOD SCHEMAS for Validation ----
const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().min(0),
  price: z.number().min(0),
});

const proposalSchema = z.object({
  client: z.string().min(1),
  contactPerson: z.string().min(1),
  projectTitle: z.string().min(1),
  projectOverview: z.string().min(1),
  goals: z.string().optional(),
  scopeOfWork: z.string().min(1),
  deliverables: z.string().optional(),
  startDate: z.string().datetime(),
  completionDate: z.string().datetime(),
  milestones: z.string().optional(),
  lineItems: z.array(lineItemSchema),
  totalAmount: z.number().min(0),
  paymentTerms: z.string().optional(),
  assumptions: z.string().optional(),
  exclusions: z.string().optional(),
  legalTerms: z.string().optional(),
  assignedTeamMember: z.string().min(1),
  internalStatus: z.enum(['Draft', 'Pending Approval', 'Approved']),
  status: z.enum(['Draft', 'Sent', 'Accepted', 'Declined']),
});

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1),
  client: z.string().min(1),
  project: z.string().min(1),
  status: z.enum(['Draft', 'Sent', 'Paid', 'Overdue']),
  lineItems: z.array(lineItemSchema),
  totalAmount: z.number().min(0),
  issueDate: z.string().datetime(),
  dueDate: z.string().datetime(),
});

const expenseSchema = z.object({
  category: z.string().min(1),
  vendor: z.string().min(1),
  amount: z.number().positive(),
  expenseDate: z.string().datetime(),
});

// Generic CRUD factory for simplicity
const createCrudController = (Model: any, schema: z.ZodObject<any, any>) => ({
  getAll: async (req: Request, res: Response) => {
    try {
      const items = await Model.find()
        .sort({ createdAt: -1 })
        .populate('client', 'clientName')
        .populate('project', 'name');
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: `Server error fetching items.` });
    }
  },
  create: async (req: Request, res: Response) => {
    try {
      const data = schema.parse(req.body);
      const newItem = await Model.create(data);
      res.status(201).json(newItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: 'Invalid data.', errors: error.issues });
      }
      res.status(500).json({ message: `Server error creating item.` });
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
});

export const proposalsController = createCrudController(
  Proposal,
  proposalSchema
);
export const invoicesController = createCrudController(Invoice, invoiceSchema);
export const expensesController = createCrudController(Expense, expenseSchema);

// Controller to get a list of clients for the proposal form
export const getClientList = async (req: Request, res: Response) => {
  try {
    const clients = await Client.find().select('clientName');
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching clients.' });
  }
};

// Controller to get projects for a specific client
export const getProjectsByClient = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const projects = await Project.find({
      _id: { $in: (await Client.findById(clientId))?.assignedProjects },
    }).select('name');
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching projects.' });
  }
};
