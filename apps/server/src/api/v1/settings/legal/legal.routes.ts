import { Router } from 'express';
import {
  getAgreements,
  createAgreement,
  deleteAgreement,
} from './legal.controller.js';

const router = Router();

router.route('/agreements').get(getAgreements).post(createAgreement);
router.route('/agreements/:id').delete(deleteAgreement);

export default router;
