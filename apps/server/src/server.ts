import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

process.on('uncaughtException', (error) => {
  console.error('🔴 An uncaught exception occurred:', error);
  process.exit(1);
});

import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './api/v1/auth/auth.routes.js';
import connectDB from './config/db.js';
import articleRoutes from './api/v1/articles/article.routes.js';
import softwareRoutes from './api/v1/software/software.routes.js';
import reportsRoutes from './api/v1/reports/reports.routes.js';
import settingsRoutes from './api/v1/settings/settings.routes.js';
import servicesRoutes from './api/v1/services/services.routes.js';
import billingRoutes from './api/v1/billing/billing.routes.js';
import invoicesRoutes from './api/v1/invoices/invoices.routes.js';
import clientPortalRoutes from './api/v1/client-portal/client-portal.routes.js';
import usersRoutes from './api/v1/users/users.routes.js';
import permissionsRoutes from './api/v1/permissions/permissions.routes.js';
import mfaRoutes from './api/v1/mfa/mfa.routes.js';
import agreementsRoutes from './api/v1/agreements/agreements.routes.js';
import auditRoutes from './api/v1/audit/audit.routes.js';
import integrationsRoutes from './api/v1/integrations/integrations.routes.js';
import backupRoutes from './api/v1/backup/backup.routes.js';
import dataRetentionRoutes from './api/v1/data-retention/data-retention.routes.js';
import projectRoutes from './api/v1/projects/projects.routes.js';
import tasksRoutes from './api/v1/tasks/tasks.routes.js';
import roleRoutes from './api/v1/roles/roles.routes.js';
import scheduleRoutes from './api/v1/schedules/schedules.routes.js';
import timeLogRoutes from './api/v1/timelogs/timeLog.routes.js';
import requestRoutes from './api/v1/requests/clockInRequest.routes.js';

connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors()); // Allow requests from your frontend
app.use(helmet()); // Basic security headers
app.use(express.json()); // To parse JSON request bodies

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/articles', articleRoutes);
app.use('/api/v1/software', softwareRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/services', servicesRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/invoices', invoicesRoutes);
app.use('/api/v1/client-portal', clientPortalRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/permissions', permissionsRoutes);
app.use('/api/v1/mfa', mfaRoutes);
app.use('/api/v1/agreements', agreementsRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/integrations', integrationsRoutes);
app.use('/api/v1/backup', backupRoutes);
app.use('/api/v1/data-retention', dataRetentionRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/tasks', tasksRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/timelogs', timeLogRoutes);
app.use('/api/v1/requests', requestRoutes);

// A simple health check route to verify the server is running
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
});
