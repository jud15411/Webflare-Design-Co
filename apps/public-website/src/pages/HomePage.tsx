// src/pages/HomePage.tsx (Updated)
import React from 'react';
import { FuturisticHero } from '../components/Hero/FuturisticHero';
import { Services } from '../components/Services/Services';
import { Portfolio } from '../components/Portfolio/Portfolio';
import { Pricing } from '../components/Pricing/Pricing';
import { Testimonials } from '../components/Testimonials/Testimonials';
import { CTASection } from '../components/CTASection/CTASection';
import { Aurora } from '../components/Visual/Aurora/Aurora';
import { LogosMarquee } from '../components/LogosMarquee';
import { FeatureHighlights } from '../components/Features/FeatureHighlights';
import { CybersecurityQuiz } from '../components/Quiz/CybersecurityQuiz'; // Import the quiz component

export const HomePage: React.FC = () => {
  return (
    <>
      <Aurora />
      <FuturisticHero />
      <LogosMarquee />
      <FeatureHighlights />
      <CybersecurityQuiz /> {/* Add the quiz component here */}
      <Testimonials />
      <CTASection />
    </>
  );
};