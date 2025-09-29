// src/components/Features/FeatureHighlights.tsx
import React, { useRef } from 'react';
import styles from './FeatureHighlights.module.css';

const features = [
  {
    title: 'Performance by design',
    text: 'We deliver blazing‑fast experiences optimized for Core Web Vitals and SEO.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    )
  },
  {
    title: 'Security that scales',
    text: 'Hardened setups, threat modeling, and best practices built‑in.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L20 6V12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12V6L12 2Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    )
  },
  {
    title: 'Design that converts',
    text: 'Clear visual hierarchy, storytelling, and brand‑forward aesthetics.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12H21" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 3V21" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    )
  }
];

export const FeatureHighlights: React.FC = () => {
  const gridRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const grid = gridRef.current;
    if (!grid) return;
    const rect = grid.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    grid.style.setProperty('--x', x + 'px');
    grid.style.setProperty('--y', y + 'px');
  };

  return (
    <section className={styles.section}>
      <div className="container">
        <header className={styles.header}>
          <h2 className={styles.title}>Built to win</h2>
          <p className={styles.subtitle}>Your website is your growth engine. We pair modern engineering and design craft to move metrics that matter.</p>
        </header>
        <div ref={gridRef} className={styles.grid} onMouseMove={handleMouseMove}>
          {features.map((f) => (
            <article key={f.title} className={styles.card}>
              <div className={styles.iconWrap}>{f.icon}</div>
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.cardText}>{f.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
