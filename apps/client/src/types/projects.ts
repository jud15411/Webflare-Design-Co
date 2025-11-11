// projects.ts

// A simple User type for the employee list
export interface User {
  _id: string;
  name: string;
}

// The client object populated in a project
export interface ProjectClient {
  _id: string;
  clientName: string;
}

// Replace the enum with a const array and a type alias
export const ProjectCategories = ['Cybersecurity', 'Web Development'] as const;
export type ProjectCategory = typeof ProjectCategories[number];


// The full Project object
export interface Project {
  _id: string;
  name: string;
  description: string;
  status: string;
  category: ProjectCategory; // Use the new type alias
  startDate: string;
  client: ProjectClient;
  team: User[];
  website_link?: string;
  target_systems?: string; // <--- ADDED for Cybersecurity
}

// The data structure for the project form
export interface ProjectFormData {
  _id?: string;
  name: string;
  description: string;
  status: string;
  category: string;
  client: string;
  team: string[];
  website_link?: string;
  target_systems?: string; // <--- ADDED for Cybersecurity
}