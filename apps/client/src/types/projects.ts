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


// The full Project object (how it's read from the DB)
export interface Project {
  _id: string;
  name: string;
  description: string;
  status: string;
  category: ProjectCategory;
  startDate: string; // New: Now a required field
  client: ProjectClient;
  team: User[];
  
  // Category-specific fields
  website_link?: string;      // Web Development specific
  target_systems?: string;    // Cybersecurity specific (Optional)
}

// The data structure for the project form (how it's sent to the DB)
export interface ProjectFormData {
  _id?: string;
  name: string;
  description: string;
  status: string;
  category: string;
  client: string;
  team: string[];
  
  // New required field
  startDate: string;
  
  // Category-specific fields
  website_link?: string;
  target_systems?: string;
}