// src/components/Visual/Aurora/Aurora.tsx
import React from 'react';
import styles from './Aurora.module.css';

export const Aurora: React.FC = () => {
  return (
    <div className={styles.auroraRoot} aria-hidden>
      <div className={`${styles.layer} ${styles.layerA}`} />
      <div className={`${styles.layer} ${styles.layerB}`} />
      <div className={`${styles.layer} ${styles.layerC}`} />
    </div>
  );
};
