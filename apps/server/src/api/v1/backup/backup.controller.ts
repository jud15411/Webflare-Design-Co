import { type Request, type Response } from 'express';
import { z } from 'zod';
import { type AuthRequest } from '../../middleware/auth.middleware.js';

// Define the interface for a backup point
interface IBackupPoint {
  id: number;
  timestamp: string;
  sizeMB: number;
  type: 'manual' | 'automatic';
}

// Dummy database (in-memory)
let backupPoints: IBackupPoint[] = [
  {
    id: 1,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    sizeMB: 5.2,
    type: 'automatic',
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    sizeMB: 4.8,
    type: 'automatic',
  },
];
let nextId = 3;

// --- Controller Functions ---

// Get all backup points
export const getBackupPoints = (req: Request, res: Response) => {
  res.status(200).json(backupPoints);
};

// Simulate a new backup
export const createBackup = (req: Request, res: Response) => {
  const newBackup: IBackupPoint = {
    id: nextId++,
    timestamp: new Date().toISOString(),
    sizeMB: Math.floor(Math.random() * (10 - 3 + 1)) + 3,
    type: 'manual',
  };
  backupPoints.push(newBackup);
  backupPoints.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  res
    .status(201)
    .json({ message: 'Backup created successfully', backup: newBackup });
};

// Simulate a restore from a backup point
export const restoreBackup = (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'Backup ID is required' });
  }

  const backupPoint = backupPoints.find((b) => b.id === parseInt(id));
  if (!backupPoint) {
    return res.status(404).json({ message: 'Backup point not found' });
  }

  res
    .status(200)
    .json({ message: `Restore initiated from backup point ${id}` });
};
