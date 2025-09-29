// src/components/UI/Button/Button.tsx (Updated)
import React, { useRef } from 'react';
import styles from './Button.module.css';

// The fix is to add AnchorHTMLAttributes to the type definition.
// This tells TypeScript that props like `download`, `target`, etc., are valid.
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & 
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  as?: 'button' | 'a';
  href?: string;
  variant?: 'primary' | 'secondary';
};

export const Button: React.FC<ButtonProps> = ({ as = 'button', href, variant = 'primary', children, onMouseMove, ...rest }) => {
  const btnRef = useRef<HTMLElement | null>(null);

  const handleMouseMove: React.MouseEventHandler<HTMLElement> = (e) => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--x', x + 'px');
    el.style.setProperty('--y', y + 'px');
    onMouseMove?.(e as any);
  };

  const className = [styles.button, variant === 'secondary' ? styles.secondary : null].filter(Boolean).join(' ');

  if (as === 'a') {
    // No changes needed here, the `...rest` will now correctly pass the `download` prop.
    return (
      <a ref={btnRef as any} href={href} className={className} onMouseMove={handleMouseMove as any} {...(rest as any)}>
        <span className={styles.glow} />
        {children}
      </a>
    );
  }
  return (
    <button ref={btnRef as any} className={className} onMouseMove={handleMouseMove as any} {...rest}>
      <span className={styles.glow} />
      {children}
    </button>
  );
};