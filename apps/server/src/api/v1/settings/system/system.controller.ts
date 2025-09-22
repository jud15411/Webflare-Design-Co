import { type Request, type Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import {
  // Fix: Import StandardAgreement from the correct file
  ApiKey,
  AuditLog,
  DataRetentionPolicy,
  BackupPoint,
} from './system.model.js';
// Fix: Import StandardAgreement from the correct file
import { StandardAgreement } from '../legal/legal.model.js';
import { type AuthRequest } from '../../../middleware/auth.middleware.js';

// Schemas
const agreementSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

const apiKeySchema = z.object({
  name: z.string().min(1),
  accessLevel: z.enum(['read', 'write', 'full']),
});

const dataRetentionSchema = z.object({
  clients: z.number().min(0),
  projects: z.number().min(0),
  invoices: z.number().min(0),
  auditLogs: z.number().min(0),
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

// API Keys Controller
export const getApiKeys = async (req: Request, res: Response) => {
  try {
    const keys = await ApiKey.find().select('-key').sort({ createdAt: -1 });
    res.status(200).json(keys);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching API keys.' });
  }
};

export const createApiKey = async (req: Request, res: Response) => {
  try {
    const data = apiKeySchema.parse(req.body);
    const key = crypto.randomBytes(32).toString('hex');
    const newKey = await ApiKey.create({ ...data, key });
    res.status(201).json(newKey);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Invalid data.', errors: error.issues });
    }
    res.status(500).json({ message: 'Server error creating API key.' });
  }
};

export const deleteApiKey = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedKey = await ApiKey.findByIdAndDelete(id);
    if (!deletedKey) {
      return res.status(404).json({ message: 'API key not found.' });
    }
    res.status(200).json({ message: 'API key deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting API key.' });
  }
};

// Audit Logs Controller
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching audit logs.' });
  }
};

// Data Retention Controller
export const getDataRetentionPolicy = async (req: Request, res: Response) => {
  try {
    const policy = await DataRetentionPolicy.findOne();
    res.status(200).json(policy || {});
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Server error fetching data retention policy.' });
  }
};

export const updateDataRetentionPolicy = async (
  req: Request,
  res: Response
) => {
  try {
    const data = dataRetentionSchema.parse(req.body);
    const updatedPolicy = await DataRetentionPolicy.findOneAndUpdate({}, data, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });
    res.status(200).json(updatedPolicy);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Invalid data.', errors: error.issues });
    }
    res
      .status(500)
      .json({ message: 'Server error updating data retention policy.' });
  }
};

// Backup & Restore Controller
export const getBackups = async (req: Request, res: Response) => {
  try {
    const backups = await BackupPoint.find().sort({ timestamp: -1 });
    res.status(200).json(backups);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching backups.' });
  }
};

export const createBackup = async (req: AuthRequest, res: Response) => {
  try {
    // Placeholder logic for creating a backup
    const newBackup = await BackupPoint.create({
      sizeMB: Math.floor(Math.random() * 500) + 100, // Mock size
      type: 'manual',
    });
    res.status(201).json(newBackup);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating backup.' });
  }
};

export const restoreBackup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const backupPoint = await BackupPoint.findById(id);
    if (!backupPoint) {
      return res.status(404).json({ message: 'Backup point not found.' });
    }
    // Placeholder logic for restoring from a backup
    res.status(200).json({ message: 'Restore initiated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error initiating restore.' });
  }
};
