import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from './tasks.controller.js';
import { protect } from '../../middleware/auth.middleware.js'; // Assuming you have auth middleware

const router = express.Router();

// Define routes
router.route('/').get(protect, getTasks).post(protect, createTask);
router.route('/:id').patch(protect, updateTask).delete(protect, deleteTask);

export default router;
