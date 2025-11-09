// src/components/Hero/FuturisticHero.tsx
import React from 'react';
import styles from './FuturisticHero.module.css';
import { GlitchText } from '../Visual/GlitchText/GlitchText';
import { AnimatedOrbs } from '../Visual/AnimatedOrbs/AnimatedOrbs';
import { ScanlineOverlay } from '../Visual/ScanlineOverlay/ScanlineOverlay';
import { Button } from '../UI/Button/Button';
import { useInView } from '../../hooks/useInView';
import { Link } from 'react-router-dom';

export const FuturisticHero: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <section className={`container ${styles.hero}`}>
      <div className={styles.bg}>
        <AnimatedOrbs />
        <ScanlineOverlay />
      </div>
      <div ref={ref} className={`${styles.content} ${inView ? styles.reveal : ''}`}>
        <GlitchText as="h1" className={styles.title}>
          Next‑generation web development & cybersecurity
        </GlitchText>
        <p className={styles.subtitle}>
          We build blazing‑fast websites and bulletproof security for ambitious brands. Bold ideas. Solid execution. Zero compromise.
        </p>
        <div className={styles.actions}>
          <Link to="/contact">
          <Button as="a" href="#contact">Start a Project</Button>
          </Link>
          <Link to="/portfolio">
            <Button as="a" href="portfolio" variant="secondary">See Work</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
