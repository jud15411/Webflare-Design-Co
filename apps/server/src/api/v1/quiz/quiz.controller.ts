// api/v1/quiz/quiz.controller.ts (Corrected)
import { type Request, type Response } from 'express';
import { QuizQuestion, QuizSettings } from './quiz.model.js';
import { z } from 'zod';
import PdfPrinter from 'pdfmake';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

// Zod Schemas for validation
const quizQuestionSchema = z.object({
  question: z.string().min(1),
  options: z.array(
    z.object({
      text: z.string().min(1),
      isCorrect: z.boolean(),
    })
  ).min(2),
  explanation: z.string().min(1),
});

const quizSettingsSchema = z.object({
    numberOfQuestions: z.number().int().min(1),
    timeLimit: z.number().int().nullable(),
    certificateThreshold: z.number().int().min(0).max(100),
    cyberStory: z.string(),
    certificateTemplate: z.string().optional(),
});

// Question Controllers
export const getQuestions = async (req: Request, res: Response) => {
    const questions = await QuizQuestion.find();
    res.status(200).json(questions);
};

export const createQuestion = async (req: Request, res: Response) => {
    try {
        const data = quizQuestionSchema.parse(req.body);
        const newQuestion = await QuizQuestion.create(data);
        res.status(201).json(newQuestion);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid data.', errors: error.issues });
        }
        res.status(500).json({ message: 'Server error creating question.' });
    }
};

export const updateQuestion = async (req: Request, res: Response) => {
    try {
        const data = quizQuestionSchema.parse(req.body);
        const updatedQuestion = await QuizQuestion.findByIdAndUpdate(req.params.id, data, { new: true });
        if (!updatedQuestion) {
            return res.status(404).json({ message: 'Question not found.' });
        }
        res.status(200).json(updatedQuestion);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid data.', errors: error.issues });
        }
        res.status(500).json({ message: 'Server error updating question.' });
    }
};

export const deleteQuestion = async (req: Request, res: Response) => {
    const deletedQuestion = await QuizQuestion.findByIdAndDelete(req.params.id);
    if (!deletedQuestion) {
        return res.status(404).json({ message: 'Question not found.' });
    }
    res.status(200).json({ message: 'Question deleted successfully.' });
};


// Settings Controllers
export const getSettings = async (req: Request, res: Response) => {
    const settings = await QuizSettings.findOne();
    res.status(200).json(settings || {});
};

export const updateSettings = async (req: Request, res: Response) => {
    try {
        const data = quizSettingsSchema.parse(req.body);
        const updatedSettings = await QuizSettings.findOneAndUpdate({}, data, { new: true, upsert: true });
        res.status(200).json(updatedSettings);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid data.', errors: error.issues });
        }
        res.status(500).json({ message: 'Server error updating settings.' });
    }
};

// New controller to generate a certificate
export const generateCertificate = async (req: Request, res: Response) => {
    try {
        const { name, score } = req.body;
        const settings = await QuizSettings.findOne();

        if (!settings || !settings.certificateTemplate) {
            return res.status(404).json({ message: 'Certificate template not found.' });
        }

        // Local font type compatible with pdfmake's PdfPrinter
        type FontDescriptors = Record<string, {
            normal: string;
            bold?: string;
            italics?: string;
            bolditalics?: string;
        }>;

        const fonts: FontDescriptors = {
            Roboto: {
                normal: 'Helvetica',
                bold: 'Helvetica-Bold',
                italics: 'Helvetica-Oblique',
                bolditalics: 'Helvetica-BoldOblique'
            }
        };

        const printer = new PdfPrinter(fonts);

        const filledTemplate = settings.certificateTemplate
            .replace('{{name}}', name)
            .replace('{{score}}', score);

        const docDefinition: TDocumentDefinitions = {
            content: [
                { text: 'Certificate of Completion', style: 'header' },
                { text: 'This is to certify that', style: 'subheader' },
                { text: name, style: 'name' },
                { text: 'has successfully completed the Cybersecurity Awareness Quiz with a score of', style: 'subheader' },
                { text: `${score}%`, style: 'score' },
                { text: '\n\n' },
                { text: filledTemplate, style: 'body' },
            ],
            styles: {
                header: {
                    fontSize: 22,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 0, 0, 20]
                },
                subheader: {
                    fontSize: 16,
                    alignment: 'center',
                    margin: [0, 10, 0, 5]
                },
                name: {
                    fontSize: 20,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 5, 0, 10]
                },
                score: {
                    fontSize: 18,
                    bold: true,
                    alignment: 'center',
                    color: '#007bff'
                },
                body: {
                    fontSize: 12,
                    margin: [0, 20, 0, 0]
                }
            }
        };

        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        const chunks: any[] = [];
        pdfDoc.on('data', (chunk: any) => chunks.push(chunk));
        pdfDoc.on('end', () => {
            const result = Buffer.concat(chunks);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=certificate.pdf');
            res.send(result);
        });
        pdfDoc.end();
    } catch (error) {
        res.status(500).json({ message: 'Error generating certificate.' });
    }
};