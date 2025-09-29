import React from 'react';

const cases = [
  {
    title: 'Fintech SaaS Platform',
    result: 'Reduced onboarding time by 42% with a streamlined React workflow and secure APIs.',
    img: 'https://images.unsplash.com/photo-1551281044-8a3430a1f8f4?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'E‑commerce Revamp',
    result: 'Increased conversion by 18% through performance tuning, UX improvements, and A/B testing.',
    img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'Cybersecurity Hardening',
    result: 'Implemented zero‑trust controls, SSO, and audit logging to meet SOC 2 requirements.',
    img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
  },
];

export const CaseStudies: React.FC = () => {
  return (
    <section id="case-studies" className="caseStudies">
      <div className="container">
        <h2 className="section-title">Our Work</h2>
        <div className="grid">
          {cases.map((c) => (
            <article className="card case-card" key={c.title}>
              <img src={c.img} alt={c.title} loading="lazy" />
              <h3>{c.title}</h3>
              <p>{c.result}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};