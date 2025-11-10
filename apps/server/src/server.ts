import { createServer } from 'http';
import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import cors, { type CorsOptions } from 'cors';

import { connectMainDB, connectPublicDB } from './config/db.js';

process.on('uncaughtException', (error) => {
  console.error('🔴 An uncaught exception occurred:', error);
  process.exit(1);
});

const allowedOrigins = [
    'https://firmaplex.tech', // Your main domain
    'https://www.firmaplex.tech', // The 'www' version
    'http://localhost:3000', // Example for local dev
    'http://localhost:5173', // Example for local dev (Vite)
    // Add your EC2 public domain/IP if you access it directly
    // e.g., 'http://ec2-xx-xx-xx.compute.amazonaws.com' 
];

const netlifyPreviewRegex = /https:\/\/(?:[a-z0-9-]+--)?webflare-design-co\.netlify\.app$/;

const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true); 

        if (allowedOrigins.includes(origin) || netlifyPreviewRegex.test(origin)) {
            callback(null, true);
        } else {
            console.error(`CORS Blocked: Origin ${origin} not allowed by policy.`);
            callback(new Error('Not allowed by CORS'), false);
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, 
};

const startServer = async () => {
  try {
    await Promise.all([connectMainDB(), connectPublicDB()]);
    console.log('✅ Both databases connected successfully.');

    const { initWebSocketServer } = await import('./websockets.js');

    const authRoutes = (await import('./api/v1/auth/auth.routes.js')).default;
    const articleRoutes = (await import('./api/v1/articles/article.routes.js')).default;
    const softwareRoutes = (await import('./api/v1/software/software.routes.js')).default;
    const reportsRoutes = (await import('./api/v1/reports/reports.routes.js')).default;
    const settingsRoutes = (await import('./api/v1/settings/settings.routes.js')).default;
    const servicesRoutes = (await import('./api/v1/services/services.routes.js')).default;
    const billingRoutes = (await import('./api/v1/billing/billing.routes.js')).default;
    const invoicesRoutes = (await import('./api/v1/invoices/invoices.routes.js')).default;
    const clientPortalRoutes = (await import('./api/v1/client-portal/client-portal.routes.js')).default;
    const usersRoutes = (await import('./api/v1/users/users.routes.js')).default;
    const permissionsRoutes = (await import('./api/v1/permissions/permissions.routes.js')).default;
    const mfaRoutes = (await import('./api/v1/mfa/mfa.routes.js')).default;
    const agreementsRoutes = (await import('./api/v1/agreements/agreements.routes.js')).default;
    const auditRoutes = (await import('./api/v1/audit/audit.routes.js')).default;
    const integrationsRoutes = (await import('./api/v1/integrations/integrations.routes.js')).default;
    const backupRoutes = (await import('./api/v1/backup/backup.routes.js')).default;
    const dataRetentionRoutes = (await import('./api/v1/data-retention/data-retention.routes.js')).default;
    const projectRoutes = (await import('./api/v1/projects/projects.routes.js')).default;
    const tasksRoutes = (await import('./api/v1/tasks/tasks.routes.js')).default;
    const roleRoutes = (await import('./api/v1/roles/roles.routes.js')).default;
    const scheduleRoutes = (await import('./api/v1/schedules/schedules.routes.js')).default;
    const timeLogRoutes = (await import('./api/v1/timelogs/timeLog.routes.js')).default;
    const requestRoutes = (await import('./api/v1/requests/clockInRequest.routes.js')).default;
    const clientRoutes = (await import('./api/v1/client/client.routes.js')).default;
    const contractRoutes = (await import('./api/v1/contracts/contract.routes.js')).default;
    const templateRoutes = (await import('./api/v1/templates/template.routes.js')).default;
    const financialRoutes = (await import('./api/v1/financials/financials.routes.js')).default;
    const subscriptionRoutes = (await import('./api/v1/subscriptions/subscriptions.routes.js')).default;
    const dashboardRoutes = (await import('./api/v1/dashboard/dashboard.routes.js')).default;
    const clientPortalAuthRoutes = (await import('./api/v1/client-portal-auth/auth.routes.js')).default;
    const portalDashboardRoutes = (await import('./api/v1/client-portal/dashboard/dashboard.routes.js')).default;
    const messageRoutes = (await import('./api/v1/messages/message.routes.js')).default;
    const portalProjectRoutes = (await import('./api/v1/client-portal/projects/projects.routes.js')).default;
    const feedbackRoutes = (await import('./api/v1/feedback/feedback.routes.js')).default;
    const sprintsRoutes = (await import('./api/v1/sprints/sprints.routes.js')).default;

    const { adminWebsiteRoutes, publicWebsiteRoutes } = (await import('./api/v1/website/website.routes.js'));


    const app = express();
    const server = createServer(app);
    const PORT = process.env.PORT || 5001;

    app.use(helmet());
    app.use(express.json());

    app.use(cors(corsOptions));

    initWebSocketServer(server);

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
    app.use('/api/v1/clients', clientRoutes);
    app.use('/api/v1/contracts', contractRoutes);
    app.use('/api/v1/templates', templateRoutes);
    app.use('/api/v1/financials', financialRoutes);
    app.use('/api/v1/subscriptions', subscriptionRoutes);
    app.use('/api/v1/dashboard', dashboardRoutes);
    app.use('/api/v1/client-portal-auth', clientPortalAuthRoutes);
    app.use('/api/v1/portal/dashboard', portalDashboardRoutes);
    app.use('/api/v1/messages', messageRoutes);
    app.use('/api/v1/portal/projects', portalProjectRoutes);
    app.use('/api/v1/feedback', feedbackRoutes);
    app.use('/api/v1/admin/website', adminWebsiteRoutes);
    app.use('/api/v1/public/website', publicWebsiteRoutes);
    app.use('api.v1/sprints', sprintsRoutes);

    app.get('/api/v1/health', (req: Request, res: Response) => {
      res.status(200).json({ status: 'OK', message: 'Server is healthy' });
    });

    server.listen(PORT, () => {
      console.log(`🚀 Server is listening on port ${PORT}`);
    });

  } catch (error) {
    console.error("🔴 Failed to start server:", error);
    process.exit(1);
  }
};

startServer();