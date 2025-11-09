// src/components/Testimonials/Testimonials.tsx
import React, { useState, useEffect } from 'react';
import API from '../../utils/axios';
import styles from './Testimonials.module.css';

interface Testimonial {
  _id: string;
  authorName: string;
  authorCompany: string;
  quote: string;
}

export const Testimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data } = await API.get('/public/website/testimonials');
        setTestimonials(data);
      } catch (error) {
        setError('Failed to fetch testimonials.');
        console.error('Failed to fetch testimonials:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <section id="testimonials" className={`${styles.testimonials} container`}>
      <h2 className={styles.title}>What Our Clients Say</h2>
      <div className={styles.grid}>
        {testimonials.map(testimonial => (
          <div key={testimonial._id} className={styles.card}>
            <p className={styles.quote}>"{testimonial.quote}"</p>
            <p className={styles.author}>- {testimonial.authorName}, <span>{testimonial.authorCompany}</span></p>
          </div>
        ))}
      </div>
    </section>
  );
};