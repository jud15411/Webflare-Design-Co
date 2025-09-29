import React from 'react';

const features = [
  {
    title: 'Custom Web Apps',
    desc: 'High-performance React/Node apps engineered for scale and speed.',
  },
  {
    title: 'Secure by Design',
    desc: 'Security-first development, audits, and hardening from day one.',
  },
  {
    title: 'Cloud-Native',
    desc: 'Deployments on AWS with modern CI/CD, observability, and resilience.',
  },
  {
    title: 'AI Integration',
    desc: 'Embed AI into workflows to boost productivity and customer experience.',
  },
  {
    title: 'Design Systems',
    desc: 'Beautiful, accessible UI systems that scale across your product suite.',
  },
  {
    title: 'Fractional Engineering',
    desc: 'Senior engineering leadership without the full-time overhead.',
  },
];

export const FeatureGrid: React.FC = () => {
  return (
    <section className="features" id="features">
      <div className="container">
        <h2 className="section-title">What We Do</h2>
        <div className="grid">
          {features.map((f) => (
            <div className="card" key={f.title}>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};