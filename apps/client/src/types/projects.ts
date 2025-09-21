// src/types/projects.ts

export interface Project {
  _id: string;
  name: string;
  description: string;
  status: string;
  category: 'Cybersecurity' | 'Web Development';
  startDate: string;
  team: { _id: string; name: string }[];
}

// This single, correct definition will be used by both components.
export type ProjectFormData = Omit<Project, '_id' | 'startDate' | 'team'> & {
  _id?: string;
};
