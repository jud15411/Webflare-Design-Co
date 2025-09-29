// api/v1/quiz/quiz.routes.ts
import { Router } from 'express';
import {
    getQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getSettings,
    updateSettings,
    generateCertificate,
} from './quiz.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { UserRole } from '../auth/user.model.js';

const router = Router();

router.use(protect, authorizeRoles(UserRole.CEO));

// Question routes
router.route('/questions').get(getQuestions).post(createQuestion);
router.route('/questions/:id').put(updateQuestion).delete(deleteQuestion);

// Settings routes
router.route('/parameters').get(getSettings).put(updateSettings);

// New route for generating the certificate
router.post('/generate-certificate', generateCertificate);


export default router;