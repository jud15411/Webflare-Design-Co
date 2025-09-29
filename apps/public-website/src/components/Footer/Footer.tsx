// src/components/Footer/Footer.tsx
import React from 'react';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className={`${styles.footer} container`}>
      <p>&copy; {currentYear} Firmaplex. All Rights Reserved.</p>
    </footer>
  );
};