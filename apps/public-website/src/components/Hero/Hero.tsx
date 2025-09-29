// src/components/Hero/Hero.tsx
import React from 'react';
import styles from './Hero.module.css';

export const Hero = () => {
  return (
    <section className="container">
      <div className={styles.content}>
        <h1 className={styles.title}>
          Next-generation web development and cybersecurity
        </h1>
        <p className={styles.description}>
          FirmaPlex is a digital agency that helps businesses build and secure
          their online presence. We are a team of passionate developers,
          designers, and security experts who are dedicated to helping our
          clients succeed.
        </p>
      </div>
    </section>
  );
};