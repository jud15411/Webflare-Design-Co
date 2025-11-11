// src/pages/Projects/CybersecurityProjectsPage.tsx

import React from 'react';
// Import the new specific component
import { CybersecurityProjectList } from '../../components/projects/CybersecurityProjectList';

export const CybersecurityProjectsPage: React.FC = () => {
  // Use the specific component instead of the generic one
  return <CybersecurityProjectList />;
};