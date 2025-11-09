// src/components/Website/Quiz/QuizSettingsForm.tsx (Updated)
import React, { useState, useEffect } from 'react';
import API from '../../../../utils/axios';
import { useAuth } from '../../../../contexts/AuthContext';
import { type QuizSettings } from '../../../../types/quiz';

interface QuizSettingsFormProps {
    settings: Partial<QuizSettings>; // Accept partial settings
    onSave: () => void;
}

const defaultSettings: QuizSettings = {
    _id: '',
    numberOfQuestions: 5,
    timeLimit: null,
    certificateThreshold: 80,
    cyberStory: '',
    certificateTemplate: '', // Changed from certificateUrl
};

export const QuizSettingsForm: React.FC<QuizSettingsFormProps> = ({ settings, onSave }) => {
    const { token } = useAuth();
    // FIX: Merge incoming settings with defaults to ensure all keys exist
    const [formData, setFormData] = useState({ ...defaultSettings, ...settings });

    useEffect(() => {
        setFormData({ ...defaultSettings, ...settings });
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'number') {
            const numValue = parseInt(value, 10);
            if (name === 'timeLimit') {
                setFormData((prev: any) => ({ ...prev, [name]: value === '' ? null : numValue }));
            } else {
                setFormData((prev: any) => ({ ...prev, [name]: isNaN(numValue) ? 0 : numValue }));
            }
        } else {
            setFormData((prev: any) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await API.put('/settings/quiz/parameters', formData, { headers: { Authorization: `Bearer ${token}` } });
            onSave();
        } catch (error) {
            console.error("Failed to save quiz settings", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="settings-form">
            <label>Number of Questions</label>
            <input type="number" name="numberOfQuestions" value={formData.numberOfQuestions} onChange={handleChange} min="1" required />
            
            <label>Time Limit (in seconds, leave blank for none)</label>
            <input type="number" name="timeLimit" value={formData.timeLimit ?? ''} onChange={handleChange} placeholder="e.g., 60" min="0" />
            
            <label>Certificate Threshold (%)</label>
            <input type="number" name="certificateThreshold" value={formData.certificateThreshold} onChange={handleChange} min="0" max="100" required />
            
            <label>Cyber Story (shown at end)</label>
            <textarea name="cyberStory" value={formData.cyberStory} onChange={handleChange} placeholder="A short, engaging cybersecurity story." />
            
            <label>Certificate Template</label>
            <textarea name="certificateTemplate" value={formData.certificateTemplate} onChange={handleChange} placeholder="Use {{name}} and {{score}} as placeholders." />
            
            <button type="submit" className="save-button">Save Settings</button>
        </form>
    );
};