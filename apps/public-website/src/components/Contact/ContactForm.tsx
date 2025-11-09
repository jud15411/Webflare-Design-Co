// src/components/Contact/ContactForm.tsx
import React, { useState } from 'react';
import styles from './ContactForm.module.css';

// 🚀 Accessing the key from the environment variable
// (Ensure your environment variable is prefixed correctly: REACT_APP_ for CRA, VITE_ for Vite)
const ACCESS_KEY = process.env.REACT_APP_WEB3FORMS_ACCESS_KEY; 

interface FormData {
  name: string;
  email: string;
  message: string;
}

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });
  const [result, setResult] = useState<string>(''); // State for success/error message

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult("Sending...");

    // Safety check: ensure the key is present
    if (!ACCESS_KEY) {
        setResult("Error: Contact key is missing. Check your .env file.");
        console.error("Web3Forms ACCESS_KEY is not defined.");
        setTimeout(() => setResult(''), 5000);
        return;
    }
    
    // Construct the data payload for the API
    const data = {
        ...formData,
        access_key: ACCESS_KEY, // The key is added dynamically
    };

    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(data)
        });

        const json = await response.json();

        if (json.success) {
            setResult("Message Sent Successfully! Thank you.");
            // Reset form
            setFormData({
                name: '',
                email: '',
                message: '',
            });
        } else {
            console.error(json);
            setResult(json.message || "Something went wrong. Please try again.");
        }
    } catch (error) {
        console.error('Submission Error:', error);
        setResult("A network error occurred. Check your connection.");
    }
    
    // Clear the result message after a few seconds
    setTimeout(() => {
        setResult('');
    }, 5000);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="name" className={styles.label}>Name</label>
        <input
          type="text"
          id="name"
          name="name"
          className={styles.input}
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>Email</label>
        <input
          type="email"
          id="email"
          name="email"
          className={styles.input}
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="message" className={styles.label}>Message</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          className={`${styles.input} ${styles.textarea}`}
          value={formData.message}
          onChange={handleChange}
          required
        />
      </div>

      {/* Submission Status Message */}
      {result && <p className={styles.statusMessage}>{result}</p>}
      
      <button type="submit" className={styles.submitButton} disabled={result === "Sending..."}>
        Send Message
      </button>
    </form>
  );
};