// src/components/Quiz/CybersecurityQuiz.tsx (Corrected)
import React, { useState, useEffect, useMemo } from 'react';
import API from '../../utils/axios';
import styles from './CybersecurityQuiz.module.css'; // Using CSS Modules
import { GlitchText } from '../Visual/GlitchText/GlitchText';
import { Button } from '../UI/Button/Button';
import { useInView } from '../../hooks/useInView';

// Interfaces for the data
interface QuizQuestion {
  _id: string;
  question: string;
  options: {
    _id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
}

interface QuizSettings {
  timeLimit: number | null;
  certificateThreshold: number;
  cyberStory: string;
  certificateTemplate: string;
}

export const CybersecurityQuiz: React.FC = () => {
  const [settings, setSettings] = useState<QuizSettings | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');


  // For the reveal animation
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // FIX: The URL was missing the `/public` segment.
        const { data } = await API.get('/api/v1/public/website/quiz');
        setSettings(data.settings);
        setQuestions(data.questions);
        if (data.settings?.timeLimit) {
          setTimeLeft(data.settings.timeLimit);
        }
      } catch (error) {
        console.error("Failed to fetch quiz data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuiz();
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      setQuizFinished(true);
    }
    if (!timeLeft || quizFinished || !inView) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => (prev ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, quizFinished, inView]);
  
  const handleAnswer = (option: { _id: string; isCorrect: boolean }) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOptionId(option._id);

    if (option.isCorrect) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setIsAnswered(false);
        setSelectedOptionId(null);
      } else {
        setQuizFinished(true);
      }
    }, 2500); // Wait 2.5 seconds before moving to the next question
  };

  const handleCertificateDownload = async () => {
    try {
        const response = await API.post('/api/v1/quiz/generate-certificate', {
            name: userName,
            score: Math.round((score / questions.length) * 100)
        }, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'certificate.pdf');
        document.body.appendChild(link);
        link.click();
    } catch (error) {
        console.error("Failed to download certificate", error);
    }
  };

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

  const getOptionClassName = (option: { _id: string; isCorrect: boolean }) => {
    if (!isAnswered) return '';
    if (option.isCorrect) return styles.correct;
    if (option._id === selectedOptionId) return styles.incorrect;
    return '';
  };
  
  if (isLoading || !settings || questions.length === 0) {
    return null; // Don't render anything if there's no data or it's loading
  }

  return (
    <section ref={ref} className={`${styles.quizSection} container ${inView ? styles.reveal : ''}`}>
      <div className={styles.quizContainer}>
        {quizFinished ? (
          <div className={styles.results}>
            <GlitchText as="h2">Quiz Complete!</GlitchText>
            <p className={styles.score}>Your final score: {score} / {questions.length}</p>
            <p className={styles.story}>{settings.cyberStory}</p>
            {score / questions.length * 100 >= settings.certificateThreshold && (
              <div>
                <input
                    type="text"
                    placeholder="Enter your name for the certificate"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className={styles.nameInput}
                />
                <Button onClick={handleCertificateDownload} disabled={!userName}>
                    Download Your Certificate
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <h2 className={styles.title}>Cybersecurity Challenge</h2>
              {timeLeft !== null && <div className={styles.timer}>Time: {timeLeft}s</div>}
            </div>
            <p className={styles.questionText}>{currentQuestion?.question}</p>
            <div className={styles.options}>
              {currentQuestion?.options.map((opt) => (
                <button
                  key={opt._id}
                  onClick={() => handleAnswer(opt)}
                  className={`${styles.optionButton} ${getOptionClassName(opt)}`}
                  disabled={isAnswered}
                >
                  {opt.text}
                </button>
              ))}
            </div>
            {isAnswered && !questions[currentQuestionIndex].options.find(o => o._id === selectedOptionId)?.isCorrect && (
              <p className={styles.explanation}>{currentQuestion?.explanation}</p>
            )}
          </>
        )}
      </div>
    </section>
  );
};