import { Router } from 'express';
import { protect } from '../../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { UserRole } from './users/users.model.js';
import companyRoutes from './company/company.routes.js';
import billingRoutes from './billing/billing.routes.js';
import usersRoutes from './users/users.routes.js';
import legalRoutes from './legal/legal.routes.js';
import systemRoutes from './system/system.routes.js';
import quizRoutes from '../quiz/quiz.routes.js';

const router = Router();

// All settings routes are protected and restricted to the CEO role
router.use(protect, authorizeRoles(UserRole.CEO));

// Mount sub-routers
router.use('/company-info', companyRoutes);
router.use('/billing', billingRoutes);
router.use('/users', usersRoutes);
router.use('/legal', legalRoutes);
router.use('/system', systemRoutes);
router.use('/quiz', quizRoutes);

export default router;
