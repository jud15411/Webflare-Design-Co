import React from 'react';
import {
  FaHome,
  FaComments,
  FaCommentDots, // Import a new icon for feedback
  FaBriefcase,
  FaGlobe,
  FaDollarSign,
  FaChartLine,
  FaUsers,
  FaBuilding,
  FaCog,
  FaBook,
  FaCode,
  FaChartBar,
  FaFileAlt,
  FaHandshake,
} from 'react-icons/fa';

// --- Type Definitions for our Navigation ---
export interface NavLinkItem {
  key: string;
  label: string;
  pathname: string;
  icon: React.ReactNode;
  children?: NavLinkItem[];
}

export interface NavDropdownItem {
  key: string;
  label: string;
  pathname: string;
  icon: React.ReactNode;
  children: NavLinkItem[];
}

export type NavItem = NavLinkItem | NavDropdownItem;

export const navLinks: { [key: string]: NavItem[] } = {
  ceo: [
    {
      key: 'dashboard',
      label: 'Dashboard',
      pathname: '/dashboard',
      icon: <FaHome />,
    },
    {
      key: 'workspace',
      label: 'Workspace',
      pathname: '/workspace',
      icon: <FaBriefcase />,
      children: [
        {
          key: 'projects',
          label: 'Projects',
          pathname: '#',
          icon: <FaBriefcase />,
          children: [
            {
              key: 'cyber-projects',
              label: 'Cybersecurity Projects',
              pathname: '/projects/cybersecurity',
              icon: <FaBriefcase />,
            },
            {
              key: 'web-projects',
              label: 'Web Dev Projects',
              pathname: '/projects/web-development',
              icon: <FaBriefcase />,
            },
          ],
        },
        {
          key: 'tasks',
          label: 'Tasks Board',
          pathname: '/tasks',
          icon: <FaBriefcase />,
        },
        {
          key: 'time-tracking',
          label: 'Time Tracking',
          pathname: '/time-tracking',
          icon: <FaBriefcase />,
        },
      ],
    },
    {
      key: 'website-content',
      label: 'Website Content',
      pathname: '/website-content',
      icon: <FaGlobe />,
      children: [
        {
          key: 'services',
          label: 'Services',
          pathname: '/website/services',
          icon: <FaGlobe />,
        },
        {
          key: 'portfolio',
          label: 'Portfolio',
          pathname: '/website/portfolio',
          icon: <FaGlobe />,
        },
        {
          key: 'pricing',
          label: 'Pricing Tiers',
          pathname: '/website/pricing',
          icon: <FaGlobe />,
        },
        {
          key: 'testimonials',
          label: 'Testimonials',
          pathname: '/website/testimonials',
          icon: <FaGlobe />,
        },
      ],
    },
    {
      key: 'financials',
      label: 'Financials',
      pathname: '/financials',
      icon: <FaDollarSign />,
      children: [
        {
          key: 'proposals',
          label: 'Proposals',
          pathname: '/proposals',
          icon: <FaFileAlt />,
        },
        {
          key: 'invoices',
          label: 'Invoices',
          pathname: '/invoices',
          icon: <FaFileAlt />,
        },
        {
          key: 'expenses',
          label: 'Expenses',
          pathname: '/expenses',
          icon: <FaDollarSign />,
        },
        {
          key: 'subscriptions',
          label: 'Client Subscriptions',
          pathname: '/subscriptions',
          icon: <FaDollarSign />,
        },
        {
          key: 'time-logs',
          label: 'Time Log Report',
          pathname: '/reports/time-logs',
          icon: <FaChartBar />,
        },
      ],
    },
    {
      key: 'clients-sales',
      label: 'Clients & Sales',
      pathname: '/clients-sales',
      icon: <FaChartLine />,
      children: [
        {
          key: 'clients',
          label: 'Clients',
          pathname: '/clients',
          icon: <FaUsers />,
        },
        {
          key: 'feedback',
          label: 'Client Feedback',
          pathname: '/feedback',
          icon: <FaCommentDots />,
        },
        {
          key: 'sales',
          label: 'Sales Pipeline',
          pathname: '/sales',
          icon: <FaChartLine />,
        },
        {
          key: 'contracts',
          label: 'Contracts',
          pathname: '/contracts',
          icon: <FaHandshake />,
        },
      ],
    },
    {
      key: 'team',
      label: 'Team',
      pathname: '/team',
      icon: <FaUsers />,
      children: [
        {
          key: 'team-management',
          label: 'Team Management',
          pathname: '/team',
          icon: <FaUsers />,
        },
        {
          key: 'schedules',
          label: 'Team Schedules',
          pathname: '/team-schedules',
          icon: <FaUsers />,
        },
      ],
    },
    {
      key: 'company',
      label: 'Company',
      pathname: '/company',
      icon: <FaBuilding />,
      children: [
        {
          key: 'knowledge-base',
          label: 'Knowledge Base',
          pathname: '/knowledge-base',
          icon: <FaBook />,
        },
        {
          key: 'software',
          label: 'Software Assets',
          pathname: '/software',
          icon: <FaCode />,
        },
        {
          key: 'reports',
          label: 'Reports',
          pathname: '/reports',
          icon: <FaChartBar />,
        },
        {
          key: 'settings',
          label: 'Settings',
          pathname: '/settings',
          icon: <FaCog />,
        },
        {
          key: 'role-management',
          label: 'Role Management',
          pathname: '/role-management',
          icon: <FaCog />,
        },
      ],
    },
  ],
  // ... other roles (developer, cto, sales) remain unchanged
  developer: [
    {
      key: 'dashboard',
      label: 'My Dashboard',
      pathname: '/dashboard',
      icon: <FaHome />,
    },
    {
      key: 'messaging',
      label: 'Messages',
      pathname: '/messaging',
      icon: <FaComments />,
    },
    {
      key: 'workspace',
      label: 'Workspace',
      pathname: '/workspace',
      icon: <FaBriefcase />,
      children: [
        {
          key: 'projects',
          label: 'Projects',
          pathname: '/projects',
          icon: <FaBriefcase />,
        },
        {
          key: 'tasks',
          label: 'Tasks Board',
          pathname: '/tasks',
          icon: <FaBriefcase />,
        },
        {
          key: 'time-tracking',
          label: 'Time Tracking',
          pathname: '/time-tracking',
          icon: <FaBriefcase />,
        },
      ],
    },
    {
      key: 'company',
      label: 'Company',
      pathname: '/company',
      icon: <FaBuilding />,
      children: [
        {
          key: 'knowledge-base',
          label: 'Knowledge Base',
          pathname: '/knowledge-base',
          icon: <FaBook />,
        },
        {
          key: 'settings',
          label: 'Settings',
          pathname: '/settings',
          icon: <FaCog />,
        },
      ],
    },
  ],
  cto: [
    {
      key: 'dashboard',
      label: 'Dashboard',
      pathname: '/dashboard',
      icon: <FaHome />,
    },
    {
      key: 'messaging',
      label: 'Messages',
      pathname: '/messaging',
      icon: <FaComments />,
    },
    {
      key: 'clients-sales',
      label: 'Clients & Sales',
      pathname: '/clients-sales',
      icon: <FaUsers />,
      children: [
        {
          key: 'clients',
          label: 'Clients',
          pathname: '/clients',
          icon: <FaUsers />,
        },
        {
          key: 'sales',
          label: 'Sales Pipeline',
          pathname: '/sales',
          icon: <FaChartLine />,
        },
        {
          key: 'contracts',
          label: 'Contracts',
          pathname: '/contracts',
          icon: <FaHandshake />,
        },
      ],
    },
    {
      key: 'financials',
      label: 'Financials',
      pathname: '/financials',
      icon: <FaDollarSign />,
      children: [
        {
          key: 'proposals',
          label: 'Proposals',
          pathname: '/proposals',
          icon: <FaFileAlt />,
        },
        {
          key: 'invoices',
          label: 'Invoices',
          pathname: '/invoices',
          icon: <FaFileAlt />,
        },
        {
          key: 'subscriptions',
          label: 'Client Subscriptions',
          pathname: '/subscriptions',
          icon: <FaDollarSign />,
        },
        {
          key: 'expenses',
          label: 'Expenses',
          pathname: '/expenses',
          icon: <FaDollarSign />,
        },
      ],
    },
    {
      key: 'workspace',
      label: 'Workspace',
      pathname: '/workspace',
      icon: <FaBriefcase />,
      children: [
        {
          key: 'projects',
          label: 'Projects',
          pathname: '/projects',
          icon: <FaBriefcase />,
        },
        {
          key: 'tasks',
          label: 'Tasks Board',
          pathname: '/tasks',
          icon: <FaBriefcase />,
        },
        {
          key: 'time-tracking',
          label: 'Time Tracking',
          pathname: '/time-tracking',
          icon: <FaBriefcase />,
        },
      ],
    },
    {
      key: 'company',
      label: 'Company',
      pathname: '/company',
      icon: <FaBuilding />,
      children: [
        {
          key: 'knowledge-base',
          label: 'Knowledge Base',
          pathname: '/knowledge-base',
          icon: <FaBook />,
        },
        {
          key: 'reports',
          label: 'Reports',
          pathname: '/reports',
          icon: <FaChartBar />,
        },
        {
          key: 'software',
          label: 'Software Assets',
          pathname: '/software',
          icon: <FaCode />,
        },
        {
          key: 'settings',
          label: 'Settings',
          pathname: '/settings',
          icon: <FaCog />,
        },
      ],
    },
  ],
  sales: [
    {
      key: 'dashboard',
      label: 'Dashboard',
      pathname: '/dashboard',
      icon: <FaHome />,
    },
    {
      key: 'clients',
      label: 'Clients',
      pathname: '/clients',
      icon: <FaChartLine />,
    },
    {
      key: 'messaging',
      label: 'Messages',
      pathname: '/messaging',
      icon: <FaComments />,
    },
    {
      key: 'sales',
      label: 'Sales Pipeline',
      pathname: '/sales',
      icon: <FaChartBar />,
    },
    {
      key: 'proposals',
      label: 'Proposals',
      pathname: '/proposals',
      icon: <FaFileAlt />,
    },
    {
      key: 'knowledge-base',
      label: 'Knowledge Base',
      pathname: '/knowledge-base',
      icon: <FaBook />,
    },
    {
      key: 'settings',
      label: 'Settings',
      pathname: '/settings',
      icon: <FaCog />,
    },
  ],
};
