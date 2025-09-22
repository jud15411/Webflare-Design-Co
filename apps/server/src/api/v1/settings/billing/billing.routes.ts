import { Router } from 'express';
import {
  getBillingSettings,
  updateBillingSettings,
  getClientPortalSettings,
  updateClientPortalSettings,
  getInvoiceSettings,
  getRecentInvoices,
} from './billing.controller.js';

const router = Router();

// Pricing & Billing
router.route('/pricing').get(getBillingSettings).put(updateBillingSettings);

// Client Portal
router
  .route('/client-portal')
  .get(getClientPortalSettings)
  .put(updateClientPortalSettings);

// Invoices & Payments - These are placeholders as no models were provided
router.route('/invoices/settings').get(getInvoiceSettings);
router.route('/invoices/recent').get(getRecentInvoices);

export default router;
