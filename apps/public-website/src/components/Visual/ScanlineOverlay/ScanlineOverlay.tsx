// src/components/Visual/ScanlineOverlay/ScanlineOverlay.tsx
import React from 'react';
import styles from './ScanlineOverlay.module.css';

export const ScanlineOverlay: React.FC = () => {
  return (
    <div className={styles.root} aria-hidden>
      <div className={styles.scanlines} />
      <div className={styles.noise} />
    </div>
  );
};
