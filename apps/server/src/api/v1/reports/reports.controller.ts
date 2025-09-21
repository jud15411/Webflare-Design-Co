import { type Request, type Response } from 'express';

// Interfaces to define the structure of our sample data
interface ProjectReport {
  id: number;
  name: string;
  status: 'Completed' | 'In Progress' | 'On Hold';
  client: string;
  revenue: number;
}

interface TicketReport {
  id: number;
  subject: string;
  status: 'Open' | 'Closed' | 'In Progress';
  priority: 'High' | 'Medium' | 'Low';
  assignedTo: string;
}

interface SecurityReport {
  month: string;
  incidents: number;
}

interface ReportsData {
  projects: ProjectReport[];
  tickets: TicketReport[];
  securityIncidents: SecurityReport[];
}

export const getReportsData = async (req: Request, res: Response) => {
  try {
    const sampleProjects: ProjectReport[] = [
      {
        id: 1,
        name: 'E-commerce Redesign',
        status: 'Completed',
        client: 'Alpha Corp',
        revenue: 25000,
      },
      {
        id: 2,
        name: 'Mobile App Development',
        status: 'In Progress',
        client: 'Beta Solutions',
        revenue: 45000,
      },
      {
        id: 3,
        name: 'Network Security Audit',
        status: 'Completed',
        client: 'Gamma Inc',
        revenue: 12000,
      },
      {
        id: 4,
        name: 'Content Management System',
        status: 'On Hold',
        client: 'Delta Corp',
        revenue: 30000,
      },
      {
        id: 5,
        name: 'Marketing Website',
        status: 'In Progress',
        client: 'Epsilon Tech',
        revenue: 18000,
      },
    ];

    const sampleTickets: TicketReport[] = [
      {
        id: 101,
        subject: 'Login issue on app',
        status: 'Open',
        priority: 'High',
        assignedTo: 'John Doe',
      },
      {
        id: 102,
        subject: 'Website performance optimization',
        status: 'Closed',
        priority: 'Medium',
        assignedTo: 'Jane Smith',
      },
      {
        id: 103,
        subject: 'SSL certificate renewal',
        status: 'Open',
        priority: 'High',
        assignedTo: 'John Doe',
      },
      {
        id: 104,
        subject: 'Integrate new payment gateway',
        status: 'In Progress',
        priority: 'Low',
        assignedTo: 'Jane Smith',
      },
    ];

    const sampleSecurity: SecurityReport[] = [
      { month: 'Jan', incidents: 3 },
      { month: 'Feb', incidents: 1 },
      { month: 'Mar', incidents: 4 },
      { month: 'Apr', incidents: 2 },
      { month: 'May', incidents: 5 },
    ];

    const reportsData: ReportsData = {
      projects: sampleProjects,
      tickets: sampleTickets,
      securityIncidents: sampleSecurity,
    };

    // Simulate network delay for a more realistic feel
    setTimeout(() => {
      res.status(200).json(reportsData);
    }, 500);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
