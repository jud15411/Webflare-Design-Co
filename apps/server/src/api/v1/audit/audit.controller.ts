import { type Request, type Response } from 'express';
import { z } from 'zod';

// Define the interface for an audit log entry
interface IAuditLog {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

// Dummy database (in-memory)
let auditLogs: IAuditLog[] = [
  {
    id: 1,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    user: 'ceo',
    action: 'Login',
    details: 'Successful login from IP 192.168.1.1',
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    user: 'ceo',
    action: 'Update Company Info',
    details: 'Changed company address to 123 New Street',
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 900000).toISOString(),
    user: 'developer',
    action: 'Login',
    details: 'Successful login from IP 10.0.0.5',
  },
  {
    id: 4,
    timestamp: new Date(Date.now() - 300000).toISOString(),
    user: 'ceo',
    action: 'Update Permissions',
    details: 'Updated permissions for the developer role',
  },
];

// --- Controller Functions ---

// Get all audit logs
export const getAuditLogs = (req: Request, res: Response) => {
  // Sort logs by timestamp in descending order (newest first)
  const sortedLogs = auditLogs.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  res.status(200).json(sortedLogs);
};
