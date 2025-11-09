// src/components/Portfolio/Portfolio.tsx
import React, { useState, useEffect } from 'react';
import API from '../../utils/axios';
import styles from './Portfolio.module.css';

interface PortfolioItem {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  projectUrl?: string;
  category: string;
}

export const Portfolio: React.FC = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await API.get('/public/website/portfolio');
        setItems(data);
      } catch (error) {
        setError('Failed to fetch portfolio items.');
        console.error('Failed to fetch portfolio items:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <section id="portfolio" className={`${styles.portfolio} container`}>
      <h2 className={styles.title}>Our Work</h2>
      <div className={styles.grid}>
        {items.map(item => (
          <a key={item._id} href={item.projectUrl || '#'} target="_blank" rel="noopener noreferrer" className={styles.card}>
            <img src={item.imageUrl} alt={item.title} className={styles.image} />
            <div className={styles.content}>
              <span className={styles.category}>{item.category}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};