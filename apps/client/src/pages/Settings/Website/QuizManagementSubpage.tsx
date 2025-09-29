// src/pages/Settings/Website/QuizManagementSubpage.tsx (Updated)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import { QuizSettingsForm } from './Quiz/QuizSettingsForm';
import { QuestionForm } from './Quiz/QuestionForm';
import { type QuizQuestion, type QuizSettings } from '../../../types/quiz';

interface QuizManagementSubpageProps {
  onBack: () => void;
}

const QuizManagementSubpage: React.FC<QuizManagementSubpageProps> = ({ onBack }) => {
  const { token } = useAuth();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [settings, setSettings] = useState<Partial<QuizSettings>>({});
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);

  const fetchQuizData = async () => {
    if (!token) return;
    try {
      const [questionsRes, settingsRes] = await Promise.all([
        axios.get('/api/v1/settings/quiz/questions', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/v1/settings/quiz/parameters', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setQuestions(questionsRes.data);
      setSettings(settingsRes.data);
    } catch (error) {
      console.error("Failed to fetch quiz data", error);
    }
  };
  
  const deleteQuestion = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await axios.delete(`/api/v1/settings/quiz/questions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchQuizData(); // Refresh the list
      } catch (error) {
        console.error("Failed to delete question", error);
      }
    }
  };

  useEffect(() => {
    fetchQuizData();
  }, [token]);

  return (
    <div className="settings-subpage">
      <header className="subpage-header">
        <button onClick={onBack} className="back-button">
          ← Back
        </button>
        <h2>Cybersecurity Quiz Management</h2>
      </header>
      <main className="settings-main">
        <div className="settings-section">
          <h3>Quiz Settings</h3>
          <QuizSettingsForm settings={settings} onSave={fetchQuizData} />
        </div>
        <div className="settings-section">
          <h3>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h3>
          <QuestionForm
            question={editingQuestion}
            onSave={() => {
              setEditingQuestion(null);
              fetchQuizData();
            }}
          />
           {editingQuestion && (
            <button onClick={() => setEditingQuestion(null)} className="cancel-button">
              Cancel Edit
            </button>
          )}
        </div>
        <div className="settings-section">
          <h3>Existing Questions</h3>
          {questions.map((q) => (
            <div key={q._id} className="agreement-card">
              <h4>{q.question}</h4>
              <button onClick={() => setEditingQuestion(q)} className="action-button">Edit</button>
              <button onClick={() => deleteQuestion(q._id)} className="delete-button">Delete</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default QuizManagementSubpage;