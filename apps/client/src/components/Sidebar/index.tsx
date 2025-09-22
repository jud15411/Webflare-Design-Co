import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useBusiness } from '../../contexts/BusinessContext';
import axios from 'axios';
import {
  FaChevronDown,
  FaChevronRight,
  FaSignOutAlt,
  FaUser,
  FaSpinner,
} from 'react-icons/fa';
import './Sidebar.css';
import { navLinks, type NavItem } from './navlinks';

// --- Component Props ---
interface SidebarComponentProps {
  closeMobileMenu?: () => void;
}

export const SidebarComponent: React.FC<SidebarComponentProps> = ({
  closeMobileMenu,
}) => {
  const { user, logout, isLoading: authLoading, token } = useAuth();
  const { settings } = useBusiness();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [openDropdowns, setOpenDropdowns] = useState<{
    [key: string]: boolean;
  }>({});
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (user?.role && token) {
        try {
          const { data } = await axios.get(
            `/api/v1/settings/users/permissions`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setPermissions(data[user.role.name as string] || []);
        } catch (error) {
          console.error('Failed to fetch permissions:', error);
        } finally {
          setLoadingPermissions(false);
        }
      } else {
        setLoadingPermissions(false);
      }
    };

    fetchPermissions();
  }, [user, token]);

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

  const filterNavLinks = (links: NavItem[]): NavItem[] => {
    if (userRole === 'ceo') {
      return links; // CEO sees everything
    }

    const filteredLinks = links.reduce((acc, item) => {
      if (permissions.includes(item.key)) {
        if (item.children) {
          const filteredChildren = filterNavLinks(item.children);
          if (filteredChildren.length > 0) {
            acc.push({ ...item, children: filteredChildren });
          }
        } else {
          acc.push(item);
        }
      }
      return acc;
    }, [] as NavItem[]);

    return filteredLinks;
  };

  const userLinks = userRole
    ? navLinks[userRole as keyof typeof navLinks] || []
    : [];
  const accessibleLinks = filterNavLinks(userLinks);

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

  if (authLoading || loadingPermissions) {
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
        {accessibleLinks.length > 0 ? (
          accessibleLinks.map(renderNavItem)
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
