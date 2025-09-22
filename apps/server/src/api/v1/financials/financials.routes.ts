import { Router } from 'express';
import {
  proposalsController,
  invoicesController,
  expensesController,
  getClientList,
  getProjectsByClient,
} from './financials.controller.js';

const router = Router();

// Special route for getting client list for forms
router.get('/clients', getClientList);
router.get('/clients/:clientId/projects', getProjectsByClient);

// Proposal Routes
router
  .route('/proposals')
  .get(proposalsController.getAll)
  .post(proposalsController.create);
router.route('/proposals/:id').delete(proposalsController.delete);

// Invoice Routes
router
  .route('/invoices')
  .get(invoicesController.getAll)
  .post(invoicesController.create);
router.route('/invoices/:id').delete(invoicesController.delete);

// Expense Routes
router
  .route('/expenses')
  .get(expensesController.getAll)
  .post(expensesController.create);
router.route('/expenses/:id').delete(expensesController.delete);

export default router;
