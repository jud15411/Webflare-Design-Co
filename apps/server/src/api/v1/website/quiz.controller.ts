// api/v1/website/quiz.controller.ts
import { type Request, type Response } from 'express';
import { QuizQuestion, QuizSettings } from '../quiz/quiz.model.js';

export const getPublicQuiz = async (req: Request, res: Response) => {
    const settings = await QuizSettings.findOne();
    const questions = await QuizQuestion.aggregate([
        { $sample: { size: settings?.numberOfQuestions || 5 } }
    ]);
    res.status(200).json({ settings, questions });
};