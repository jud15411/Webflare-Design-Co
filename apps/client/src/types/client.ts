/**
 * Defines the possible login statuses for a Client User in the Client Portal.
 * Using a union type of string literals avoids common TypeScript build errors
 * associated with certain 'enum' syntaxes (like ts(1294) when 'erasableSyntaxOnly' is enabled).
 */
export type ClientLoginStatus = 
  'PENDING_CREATION' | 
  'ACCESS_GRANTED' | 
  'ACCESS_REVOKED' | 
  'PASSWORD_NEEDS_SETUP';

// Interface for the client data retrieved from the server, adding the portal status
export interface Client {
  _id: string;
  clientName: string;
  primaryContact: { name: string; role: string; email: string; phone?: string };
  additionalContacts: {
    name: string;
    role: string;
    email: string;
    phone?: string;
  }[];
  status: 'Active' | 'Inactive' | 'Prospect' | 'Lead' | 'Suspended';
  address?: string;
  website?: string;
  industry?: string;
  servicesPurchased: string[];
  assignedProjects: { _id: string; name: string }[];
  assignedTeamMembers: { _id: string; name: string }[];
  contractStartDate?: string;
  contractEndDate?: string;
  billingDetails: {
    paymentMethod?: string;
    subscriptionPlan?: string;
    outstandingBalance?: number;
  };
  securitySlaLevel?: string;
  incidentHistory: string[];
  preferredCommunicationMethod?: string;
  // This field is merged from the ClientUser model in the backend
  portalAccessGranted?: boolean; 
  portalUserId?: string; // The ID of the ClientUser entry
}