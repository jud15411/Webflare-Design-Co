import { type Response } from 'express';
import { z } from 'zod';
import { Article, articleSections } from './article.model.js';
import { type AuthRequest } from '../../middleware/auth.middleware.js';
import { Role } from '../roles/role.model.js';
import { UserRole } from '../auth/user.model.js';

// FIX: Correct Zod enum validation syntax
const articleSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  content: z.string().min(10, 'Content must be at least 10 characters long.'),
  section: z.enum(articleSections, {
    required_error: 'Please select a section for the article.',
  }),
  status: z.enum(['Draft', 'Published']).optional(),
});

// Create a new knowledge base article
export const createArticle = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, section, status } = articleSchema.parse(req.body);
    const { _id: authorId, name, role } = req.user!;

    const newArticle = await Article.create({
      title,
      content,
      section,
      status: status || 'Published',
      author: authorId,
      authorName: name,
      role,
    });

    res.status(201).json({
      message: 'Article created successfully',
      article: newArticle,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Invalid data provided', errors: error.issues });
    }
    console.error('Error creating article:', error);
    res.status(500).json({ message: 'Server error while creating article.' });
  }
};

// ... (rest of the file remains the same)
export const getArticles = async (req: AuthRequest, res: Response) => {
  try {
    const userRoleDoc = await Role.findById(req.user!.role);
    const isCEO = userRoleDoc?.name === UserRole.CEO;

    const query = isCEO ? {} : { status: 'Published' };
    const articles = await Article.find(query).sort({
      section: 1,
      createdAt: -1,
    });
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
export const updateArticle = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const articleData = articleSchema.parse(req.body);
    const updatedArticle = await Article.findByIdAndUpdate(id, articleData, {
      new: true,
    });
    if (!updatedArticle) {
      return res.status(404).json({ message: 'Article not found.' });
    }
    res.status(200).json(updatedArticle);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Invalid data provided', errors: error.issues });
    }
    res.status(500).json({ message: 'Server error while updating article.' });
  }
};
export const deleteArticle = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deletedArticle = await Article.findByIdAndDelete(id);
    if (!deletedArticle) {
      return res.status(404).json({ message: 'Article not found.' });
    }
    res.status(200).json({ message: 'Article deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting article.' });
  }
};
