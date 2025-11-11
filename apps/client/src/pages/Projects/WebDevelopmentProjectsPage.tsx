// src/pages/Projects/WebDevelopmentProjectsPage.tsx

import React from 'react';
// Import the new specific component
import { WebDevelopmentProjectList } from '../../components/projects/web-development/WebDevelopmentProjectList'; 

export const WebDevelopmentProjectsPage: React.FC = () => {
  // Use the specific component instead of the generic one
  return <WebDevelopmentProjectList />;
};