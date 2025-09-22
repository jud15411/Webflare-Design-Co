import { Router } from 'express';
import {
  getAgreements,
  createAgreement,
  deleteAgreement,
  getApiKeys,
  createApiKey,
  deleteApiKey,
  getAuditLogs,
  getDataRetentionPolicy,
  updateDataRetentionPolicy,
  getBackups,
  createBackup,
  restoreBackup,
} from './system.controller.js';

const router = Router();

// Standard Agreements
router.route('/agreements').get(getAgreements).post(createAgreement);
router.route('/agreements/:id').delete(deleteAgreement);

// API Keys & Integrations
router.route('/integrations').get(getApiKeys).post(createApiKey);
router.route('/integrations/:id').delete(deleteApiKey);

// Audit Logs
router.route('/audit').get(getAuditLogs);

// Data Retention
router
  .route('/data-retention')
  .get(getDataRetentionPolicy)
  .put(updateDataRetentionPolicy);

// Backup & Restore
router.route('/backup').get(getBackups).post(createBackup);
router.route('/backup/:id/restore').post(restoreBackup);

export default router;
