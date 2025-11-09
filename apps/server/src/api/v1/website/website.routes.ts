import { Router } from 'express';
import { protect } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { UserRole } from '../settings/users/users.model.js';
import { servicesController, portfolioController, pricingController, testimonialsController } from './website.controller.js';
import { publicQuizRoutes } from './quiz.routes.js';

const adminRouter = Router();
const publicRouter = Router();

// Protect all admin routes and restrict to CEO
adminRouter.use(protect, authorizeRoles(UserRole.CEO));

// --- Admin Routes ---
adminRouter.route('/services').get(servicesController.getAll).post(servicesController.create);
adminRouter.route('/services/:id').put(servicesController.update).delete(servicesController.delete);

adminRouter.route('/portfolio').get(portfolioController.getAll).post(portfolioController.create);
adminRouter.route('/portfolio/:id').put(portfolioController.update).delete(portfolioController.delete);

adminRouter.route('/pricing').get(pricingController.getAll).post(pricingController.create);
adminRouter.route('/pricing/:id').put(pricingController.update).delete(pricingController.delete);

adminRouter.route('/testimonials').get(testimonialsController.getAll).post(testimonialsController.create);
adminRouter.route('/testimonials/:id').put(testimonialsController.update).delete(testimonialsController.delete);


// --- Public Routes ---
publicRouter.get('/services', servicesController.getPublic);
publicRouter.get('/portfolio', portfolioController.getPublic);
publicRouter.get('/pricing', pricingController.getPublic);
publicRouter.get('/testimonials', testimonialsController.getPublic);
publicRouter.use('/quiz', publicQuizRoutes);


export { adminRouter as adminWebsiteRoutes, publicRouter as publicWebsiteRoutes };