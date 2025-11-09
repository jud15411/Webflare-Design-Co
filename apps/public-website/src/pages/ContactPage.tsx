// src/pages/ContactPage.tsx
import React from 'react';
import { ContactForm } from '../components/Contact/ContactForm'; // <--- NEW IMPORT

export const ContactPage: React.FC = () => {
  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <h1>Get in Touch</h1>
      <p style={{marginBottom: '2rem'}}>We're here to answer any questions you may have. Contact us today!</p>
      
      {/* RENDER THE FORM COMPONENT */}
      <ContactForm /> 
    </div>
  );
};