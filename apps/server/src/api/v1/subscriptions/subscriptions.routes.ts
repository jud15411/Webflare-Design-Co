import { Router } from 'express';
import {
  getSubscriptions,
  createSubscription,
  deleteSubscription,
} from './subscriptions.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.route('/').get(getSubscriptions).post(createSubscription);
router.route('/:id').delete(deleteSubscription);

export default router;
