// src/components/CTASection/CTASection.tsx
import React from 'react';
import styles from './CTASection.module.css';

export const CTASection: React.FC = () => {
  return (
    <section className={`${styles.cta} container`}>
      <div className={styles.content}>
        <h2 className={styles.title}>Let’s build something exceptional</h2>
        <p className={styles.description}>From MVPs to enterprise systems — we design, ship, and secure modern products end‑to‑end.</p>
        <a className={styles.button} href="mailto:contact@firmaplex.co">Start a project</a>
      </div>
    </section>
  );
};