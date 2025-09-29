// src/components/Visual/GlitchText/GlitchText.tsx
import React from 'react';
import styles from './GlitchText.module.css';

type GlitchTextProps = {
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
  className?: string;
};

export const GlitchText: React.FC<GlitchTextProps> = ({ as: Tag = 'span', children, className }) => {
  const text = typeof children === 'string' ? children : '';
  return (
    <Tag className={[styles.glitch, className].filter(Boolean).join(' ')} data-text={text}>
      {children}
    </Tag>
  );
};
