// api/v1/quiz/quiz.model.ts
import { Schema, Document, model } from 'mongoose';
import { getMainDb } from '../../../config/db.js';

export interface IQuizQuestion extends Document {
  question: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
}

export interface IQuizSettings extends Document {
  numberOfQuestions: number;
  timeLimit: number | null;
  certificateThreshold: number;
  cyberStory: string;
  certificateTemplate: string;
}

const quizQuestionSchema = new Schema<IQuizQuestion>({
  question: { type: String, required: true, trim: true },
  options: [
    {
      text: { type: String, required: true },
      isCorrect: { type: Boolean, required: true, default: false },
    },
  ],
  explanation: { type: String, required: true, trim: true },
});

const quizSettingsSchema = new Schema<IQuizSettings>({
  numberOfQuestions: { type: Number, default: 5 },
  timeLimit: { type: Number, default: null },
  certificateThreshold: { type: Number, default: 80 },
  cyberStory: { type: String, default: 'Stay safe online!' },
  certificateTemplate: { type: String, default: 'Congratulations {{name}} on scoring {{score}}!' },
});

export const QuizQuestion = getMainDb().model<IQuizQuestion>(
  'QuizQuestion',
  quizQuestionSchema
);
export const QuizSettings = getMainDb().model<IQuizSettings>(
  'QuizSettings',
  quizSettingsSchema
);