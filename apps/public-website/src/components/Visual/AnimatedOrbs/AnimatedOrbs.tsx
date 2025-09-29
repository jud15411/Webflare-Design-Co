// src/components/Visual/AnimatedOrbs/AnimatedOrbs.tsx
import React, { useEffect, useRef } from 'react';
import styles from './AnimatedOrbs.module.css';

export const AnimatedOrbs: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  // Optional subtle parallax on mouse move
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const handler = (e: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width; // -0.5..0.5
      const dy = (e.clientY - cy) / rect.height;
      root.style.setProperty('--parallax-x', `${dx * 10}px`);
      root.style.setProperty('--parallax-y', `${dy * 10}px`);
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return (
    <div ref={rootRef} className={styles.root} aria-hidden>
      <div className={styles.orb} style={{ transform: 'translate3d(var(--parallax-x,0), var(--parallax-y,0), 0)' }} />
      <div className={styles.orb} style={{ transform: 'translate3d(calc(var(--parallax-x,0) * -0.6), calc(var(--parallax-y,0) * -0.6), 0)' }} />
      <div className={styles.orb} style={{ transform: 'translate3d(calc(var(--parallax-x,0) * 0.3), calc(var(--parallax-y,0) * 0.3), 0)' }} />
    </div>
  );
};
