import { type Response } from 'express';
import { z } from 'zod';
import { Article } from './article.model.js';
import { type AuthRequest } from '../../middleware/auth.middleware.js';

// Zod schema for article creation validation
const articleSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  content: z.string().min(10, 'Content must be at least 10 characters long.'),
});

// Create a new knowledge base article
export const createArticle = async (req: AuthRequest, res: Response) => {
  // Add a guard clause to check for the user.
  // This satisfies TypeScript and makes the code safer.
  if (!req.user) {
    return res
      .status(401)
      .json({ message: 'Not authorized to perform this action.' });
  }

  try {
    // 1. Validate the incoming request body
    const { title, content } = articleSchema.parse(req.body);

    // 2. Destructure properties from the user object (now safely accessed)
    // Mongoose uses `_id`, so we rename it to `authorId` for clarity.
    const { _id: authorId, name, role } = req.user;

    // 3. Create the article with the author's information
    const newArticle = await Article.create({
      title,
      content,
      author: authorId,
      authorName: name,
      role, // Assumes role is an ObjectId
    });

    res.status(201).json({
      message: 'Article created successfully',
      article: newArticle,
    });
  } catch (error) {
    // Handle validation errors from Zod
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid data provided',
        errors: error.issues,
      });
    }
    // Handle other potential errors
    console.error('Error creating article:', error);
    res.status(500).json({ message: 'Server error while creating article.' });
  }
};

// Get all articles (no changes needed here)
export const getArticles = async (req: AuthRequest, res: Response) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
