// src/components/Pricing/Pricing.tsx
import React, { useState, useEffect } from 'react';
import API from '../../utils/axios';
import styles from './Pricing.module.css';

interface PricingTier {
  _id: string;
  name: string;
  price: string;
  frequency: string;
  features: string[];
  isFeatured: boolean;
}

export const Pricing: React.FC = () => {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const { data } = await API.get('/public/website/pricing');
        setTiers(data);
      } catch (error) {
        setError('Failed to fetch pricing tiers.');
        console.error('Failed to fetch pricing tiers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTiers();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <section id="pricing" className={`${styles.pricing} container`}>
      <h2 className={styles.title}>Flexible Pricing</h2>
      <div className={styles.grid}>
        {tiers.map(tier => (
          <div key={tier._id} className={`${styles.card} ${tier.isFeatured ? styles.featured : ''}`}>
            <h3>{tier.name}</h3>
            <p className={styles.price}>{tier.price}<span>/{tier.frequency}</span></p>
            <ul>
              {tier.features.map((feature, index) => <li key={index}>{feature}</li>)}
            </ul>
            <a href="#contact" className={styles.button}>Get Started</a>
          </div>
        ))}
      </div>
    </section>
  );
};