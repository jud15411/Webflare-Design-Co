import { Router } from 'express';
import { createArticle, getArticles } from './article.controller.js';
import { protect } from '../../middleware/auth.middleware.js'; // This will be your authentication middleware

const router = Router();

// Routes for knowledge base articles
router.route('/').post(protect, createArticle).get(protect, getArticles);

export default router;
