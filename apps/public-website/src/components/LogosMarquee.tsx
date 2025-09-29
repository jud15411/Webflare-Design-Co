import React from 'react';

const logos = [
  { alt: 'AWS', src: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/amazonaws.svg' },
  { alt: 'Cloudflare', src: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/cloudflare.svg' },
  { alt: 'React', src: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/react.svg' },
  { alt: 'Next.js', src: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/nextdotjs.svg' },
  { alt: 'Node.js', src: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/nodedotjs.svg' },
  { alt: 'MongoDB', src: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/mongodb.svg' },
];

export const LogosMarquee: React.FC = () => {
  return (
    <section className="logosMarquee" aria-label="Trusted technologies">
      <div className="container">
        <div className="logosMarquee-track">
          {[...logos, ...logos].map((logo, i) => (
            <div className="logosMarquee-item" key={logo.alt + i}>
              <img src={logo.src} alt={logo.alt} loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
