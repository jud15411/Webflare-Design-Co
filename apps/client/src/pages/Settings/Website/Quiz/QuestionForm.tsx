// src/components/Website/Quiz/QuestionForm.tsx (Corrected)
import React, { useState, useEffect } from 'react';
import API from '../../../../utils/axios';
import { useAuth } from '../../../../contexts/AuthContext';
import { type QuizQuestion } from '../../../../types/quiz';

interface QuestionFormProps {
    question: QuizQuestion | null;
    onSave: () => void;
}

const initialFormState = {
    question: '',
    options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
    ],
    explanation: '',
};

export const QuestionForm: React.FC<QuestionFormProps> = ({ question, onSave }) => {
    const { token } = useAuth();
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (question) {
            setFormData({
                question: question.question,
                options: question.options,
                explanation: question.explanation
            });
        } else {
            setFormData(initialFormState);
        }
    }, [question]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleOptionChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const newOptions = [...formData.options];
        newOptions[index] = { ...newOptions[index], text: e.target.value };
        setFormData(prev => ({ ...prev, options: newOptions }));
    };
    
    const handleCorrectChange = (index: number) => {
        const newOptions = formData.options.map((opt, i) => ({ ...opt, isCorrect: i === index }));
        setFormData(prev => ({ ...prev, options: newOptions }));
    }

    const addOption = () => {
        setFormData(prev => ({
            ...prev,
            options: [...prev.options, { text: '', isCorrect: false }]
        }));
    };

    const removeOption = (indexToRemove: number) => {
        let newOptions = formData.options.filter((_, index) => index !== indexToRemove);
        // If the removed option was the correct one, and there are options left,
        // set the first option as the new correct one.
        const isCorrectOptionRemoved = !newOptions.some(opt => opt.isCorrect);
        if (isCorrectOptionRemoved && newOptions.length > 0) {
            newOptions = newOptions.map((opt, index) => ({
                ...opt,
                isCorrect: index === 0
            }));
        }
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Filter out empty options before saving
        const payload = {
            ...formData,
            options: formData.options.filter(opt => opt.text.trim() !== '')
        };

        if (payload.options.length < 2) {
            alert("Please provide at least two non-empty options.");
            return;
        }

        try {
            if (question) {
                await API.put(`/settings/quiz/questions/${question._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                await API.post('/settings/quiz/questions', payload, { headers: { Authorization: `Bearer ${token}` } });
            }
            onSave();
        } catch (error) {
            console.error("Failed to save question", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="settings-form">
            <label>Question Text</label>
            <input name="question" value={formData.question} onChange={handleChange} placeholder="e.g., What is phishing?" required />
            
            <label>Options (select the correct one)</label>
            {formData.options.map((opt, i) => (
                <div key={i} className="quiz-option-row">
                    <input
                        type="radio"
                        name="correctOption"
                        checked={opt.isCorrect}
                        onChange={() => handleCorrectChange(i)}
                        title="Mark as correct"
                    />
                    <input
                        className="option-text-input"
                        name="text"
                        value={opt.text}
                        onChange={(e) => handleOptionChange(i, e)}
                        placeholder={`Option ${i + 1}`}
                    />
                    {formData.options.length > 2 && (
                        <button type="button" onClick={() => removeOption(i)} className="remove-option-btn" title="Remove option">
                            &times;
                        </button>
                    )}
                </div>
            ))}
            <button type="button" onClick={addOption} className="secondary-button" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
                Add Another Option
            </button>
            
            <label style={{ marginTop: '20px' }}>Explanation for Incorrect Answer</label>
            <textarea name="explanation" value={formData.explanation} onChange={handleChange} placeholder="Explain why the other options are wrong." required />
            
            <button type="submit" className="save-button">{question ? 'Update Question' : 'Create Question'}</button>
        </form>
    );
};