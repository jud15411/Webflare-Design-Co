import { Router } from 'express';
import {
  createArticle,
  getArticles,
  updateArticle,
  deleteArticle,
} from './article.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorizeRoles } from '../../middleware/role.middleware.js';
import { UserRole } from '../settings/users/users.model.js';

const router = Router();

// This setup is correct and uses your middleware as intended.
// It ensures only a user with the 'CEO' role can create, update, or delete.
router
  .route('/')
  .post(protect, authorizeRoles(UserRole.CEO), createArticle)
  .get(protect, getArticles);

router
  .route('/:id')
  .put(protect, authorizeRoles(UserRole.CEO), updateArticle)
  .delete(protect, authorizeRoles(UserRole.CEO), deleteArticle);

export default router;
