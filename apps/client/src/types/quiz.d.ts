// src/types/quiz.d.ts
export interface QuizQuestion {
  _id: string;
  question: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
}

export interface QuizSettings {
  _id: string;
  numberOfQuestions: number;
  timeLimit: number | null;
  certificateThreshold: number;
  cyberStory: string;
  certificateTemplate: string;
}