import { Router } from 'express';
import {
  getInvoicePaymentSettings,
  addPaymentRule,
  getRecentInvoices,
} from './invoices.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { UserRole } from '../auth/user.model.js';

const router = Router();

// Protect all invoice routes for CEOs only
router.use(protect, authorizeRoles(UserRole.CEO));

router.route('/settings').get(getInvoicePaymentSettings);
router.route('/rules').post(addPaymentRule);
router.route('/recent').get(getRecentInvoices);

export default router;
