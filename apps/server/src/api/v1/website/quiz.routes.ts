// api/v1/website/quiz.routes.ts
import { Router } from 'express';
import { getPublicQuiz } from './quiz.controller.js';

const router = Router();

router.get('/', getPublicQuiz);

export { router as publicQuizRoutes };