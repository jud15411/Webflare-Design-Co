import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useBusiness } from '../../contexts/BusinessContext';
import {
  FaHome,
  FaComments,
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
  FaChevronDown,
  FaChevronRight,
  FaSignOutAlt,
  FaUser,
  FaSpinner,
} from 'react-icons/fa';
import './Sidebar.css';

// --- Type Definitions for our Navigation ---
interface NavLinkItem {
  key: string;
  label: string;
  pathname: string;
  icon: React.ReactNode;
  children?: NavLinkItem[];
}

interface NavDropdownItem {
  key: string;
  label: string;
  pathname: string;
  icon: React.ReactNode;
  children: NavLinkItem[];
}

type NavItem = NavLinkItem | NavDropdownItem;

// --- Component Props ---
interface SidebarComponentProps {
  closeMobileMenu?: () => void;
}

export const SidebarComponent: React.FC<SidebarComponentProps> = ({
  closeMobileMenu,
}) => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { settings } = useBusiness(); // Remove businessLoading since we're not using it
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [openDropdowns, setOpenDropdowns] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleDropdown = (key: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (closeMobileMenu) {
      closeMobileMenu();
    }
  };

  // Navigation configuration based on roles
  const navLinks: { [key: string]: NavItem[] } = {
    ceo: [
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
            key: 'pages',
            label: 'Manage Pages',
            pathname: '/pages',
            icon: <FaGlobe />,
          },
          {
            key: 'services',
            label: 'Services',
            pathname: '/services',
            icon: <FaGlobe />,
          },
          {
            key: 'portfolio',
            label: 'Portfolio',
            pathname: '/portfolio',
            icon: <FaGlobe />,
          },
          {
            key: 'pricing',
            label: 'Pricing Tiers',
            pathname: '/pricing',
            icon: <FaGlobe />,
          },
          {
            key: 'testimonials',
            label: 'Testimonials',
            pathname: '/testimonials',
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
            key: 'role-settings',
            label: 'Role Management',
            pathname: '/settings/roles',
            icon: <FaCog />,
          },
        ],
      },
    ],
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

  // Extract user role with better error handling
  const getUserRole = () => {
    if (!user?.role) return null;

    if (typeof user.role === 'string') {
      return user.role;
    }

    if (typeof user.role === 'object' && user.role !== null) {
      return (user.role as any).name || null;
    }

    return null;
  };

  const userRole = getUserRole();
  const userLinks = userRole
    ? navLinks[userRole as keyof typeof navLinks] || []
    : [];

  const renderNavItem = (item: NavItem) => {
    const isActive =
      pathname === item.pathname || pathname.startsWith(item.pathname + '/');

    if ('children' in item && item.children) {
      const isOpen = openDropdowns[item.key];
      const hasActiveChild = item.children.some(
        (child) => pathname === child.pathname
      );

      return (
        <div key={item.key} className="nav-item">
          <button
            onClick={() => toggleDropdown(item.key)}
            className={`nav-button nav-dropdown-button ${
              isActive || hasActiveChild ? 'active' : ''
            }`}>
            <div className="nav-button-content">
              <div className="nav-button-left">
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </div>
              <span className={`nav-arrow ${isOpen ? 'open' : ''}`}>
                {isOpen ? <FaChevronDown /> : <FaChevronRight />}
              </span>
            </div>
          </button>

          <div className={`nav-submenu ${isOpen ? 'open' : ''}`}>
            {item.children.map((subItem) => renderNavItem(subItem))}
          </div>
        </div>
      );
    }

    return (
      <div key={item.key} className="nav-item">
        <Link
          to={item.pathname}
          onClick={closeMobileMenu}
          className={`nav-button ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </Link>
      </div>
    );
  };

  // Show loading state while authentication is being restored
  if (authLoading) {
    return (
      <aside className="custom-sidebar">
        <div className="sidebar-header">
          <div
            className="loading-container"
            style={{ textAlign: 'center', padding: '20px' }}>
            <FaSpinner className="spinning-icon" />
            <p style={{ marginTop: '10px', fontSize: '14px' }}>Loading...</p>
          </div>
        </div>
      </aside>
    );
  }

  // Don't render if user is not available (shouldn't happen in protected routes)
  if (!user) {
    return null;
  }

  return (
    <aside className="custom-sidebar">
      <div className="sidebar-header">
        <h3 className="welcome-text">Welcome, {user?.name || 'User'}!</h3>
        <p className="business-name">
          {settings?.businessName || 'Webflare Admin'}
        </p>
      </div>

      <nav className="sidebar-nav">
        {userLinks.length > 0 ? (
          userLinks.map(renderNavItem)
        ) : (
          <div className="no-navigation">
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '14px',
                textAlign: 'center',
              }}>
              No navigation items available for your role.
            </p>
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <Link
          to="/profile"
          className={`nav-button profile-button ${
            pathname === '/profile' ? 'active' : ''
          }`}>
          <span className="nav-icon">
            <FaUser />
          </span>
          <span className="nav-label">Profile Settings</span>
        </Link>

        <button onClick={handleLogout} className="nav-button logout-button">
          <span className="nav-icon">
            <FaSignOutAlt />
          </span>
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </aside>
  );
};
