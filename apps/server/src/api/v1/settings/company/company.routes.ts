import { Router } from 'express';
import {
  getCompanyInfo,
  updateCompanyInfo,
  getServices,
  createService,
  deleteService,
} from './company.controller.js';

const router = Router();

// Company Info
router.route('/').get(getCompanyInfo).put(updateCompanyInfo);

// Services
router.route('/services').get(getServices).post(createService);
router.route('/services/:id').delete(deleteService);

export default router;
