// src/components/Services/Services.tsx
import React, { useState, useEffect } from 'react';
import API from '../../utils/axios';
import styles from './Services.module.css';

interface Service {
  _id: string;
  name: string;
  description: string;
}

export const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await API.get('/api/v1/public/website/services');
        setServices(data);
      } catch (error) {
        setError('Failed to fetch services.');
        console.error('Failed to fetch services:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <section id="services" className={`${styles.services} container`}>
      <h2 className={styles.title}>Our Services</h2>
      <div className={styles.grid}>
        {services.map(service => (
          <div key={service._id} className={styles.card}>
            <h3>{service.name}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};