// Define the strict literal string types for status and priority from the backend model
export type TicketStatus = 
  | 'New' 
  | 'Open' 
  | 'In Progress' 
  | 'On Hold' 
  | 'Awaiting Client Reply' 
  | 'Resolved' 
  | 'Closed';
  
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent/Critical';

// --- Interface Definitions for Populated Fields ---
interface IAssignedAgent {
    _id: string;
    name: string;
    role?: string;
}

interface IProjectLite {
    name: string;
    category: string;
}

interface IClientLite {
    clientName: string;
}

// Define the message structure, including _id as it's a Mongoose subdocument
export interface IMessage {
  _id: string; // Critical for rendering list keys and satisfying previous errors
  senderType: 'client' | 'admin';
  body: string;
  createdAt: string; // ISO Date string
}

// Define the main ITicket interface for the client application
export interface ITicket {
  _id: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus; // <-- FIX: Uses the strict TicketStatus type
  category: 'Cybersecurity' | 'Web Development';
  // Populated fields (optional as the API might not always populate)
  client?: IClientLite; 
  project?: IProjectLite;
  assignedAgent?: IAssignedAgent;
  messages: IMessage[];
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}