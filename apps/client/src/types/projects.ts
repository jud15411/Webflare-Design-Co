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

// The full Project object
export interface Project {
  _id: string;
  name: string;
  description: string;
  status: string;
  category: string;
  startDate: string;
  client: ProjectClient;
  team: User[]; // Team is an array of User objects
}

// The data structure for the project form
export interface ProjectFormData {
  _id?: string;
  name: string;
  description: string;
  status: string;
  category: string;
  client: string; // client is a string (ID)
  team: string[]; // team is an array of strings (User IDs)
}
