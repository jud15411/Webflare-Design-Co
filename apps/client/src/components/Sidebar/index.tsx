import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; 
import { useBusiness } from '../../contexts/BusinessContext';
import API from '../../utils/axios';
import {
  FaChevronRight,
  FaSignOutAlt,
  FaUser, // FIX: Used explicitly for fallback icon
  FaSpinner,
} from 'react-icons/fa';
import './Sidebar.css';
import { navLinks, type NavItem, type NavLinkItem, type NavDropdownItem } from './navlinks';

// --- Type Definitions ---
// Define the allowed role keys based on the structure of navLinks
// Assumes that the type of user.role aligns with the keys in navLinks (e.g., 'ceo', 'sales', 'developer')
type RoleKey = keyof typeof navLinks; 

// --- Helper Functions ---
/** Gets the first initial of the first and last name for the avatar fallback. */
const getInitials = (name: string | undefined): string => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
};

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

  // --- Permission Fetching Logic ---
  useEffect(() => {
    const fetchPermissions = async () => {
      if (user?.role.name && token) { 
        try {
          // Assuming API endpoint is /settings/users/permissions/:role
          const { data } = await API.get(
            `/settings/users/permissions/${user.role}`, 
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setPermissions(data.permissions || []);
        } catch (err) {
          console.error('Failed to fetch permissions:', err);
          setPermissions([]); 
        } finally {
          setLoadingPermissions(false);
        }
      } else if (!user) {
        setLoadingPermissions(false);
      }
    };

    fetchPermissions();
  }, [user?.role.name, token]); 


  const hasPermission = (key: string): boolean => {
    if (key === 'dashboard' || key === 'profile') return true; 

    return permissions.includes(key); 
  };
  
  const toggleDropdown = (key: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    closeMobileMenu?.();
  };

  // --- Role-based Link Filtering (FIXED) ---
  let accessibleLinks: NavItem[] = [];

  if (user?.role.name) {
    // FIX: Convert type to unknown first to satisfy strict TS index checking (ts(2352))
    const roleKey = user.role.name as unknown as RoleKey; 
    
    // Check if the role key exists, otherwise fall back to 'default'
    const roleLinks = navLinks[roleKey] || navLinks.default; 

    if (roleLinks) {
        accessibleLinks = roleLinks.filter((item) => {
            const isDropdown = 'children' in item && item.children;

            if (isDropdown) { 
                // Dropdowns are included if ANY child is accessible
                return (item as NavDropdownItem).children.some(child => hasPermission(child.key));
            }
            // Leaf links are included only if they have permission
            return hasPermission(item.key);
        });
    }
  } else {
    // Fallback for unauthenticated users
    accessibleLinks = navLinks.default?.filter((item) => hasPermission(item.key)) || [];
  }
  
  // --- NEW Avatar Display Component for Sidebar Footer (FIXED FaUser usage) ---
  const AvatarDisplay: React.FC = () => {
    const avatarUrl = user?.avatarUrl;

    return (
        <div className="profile-avatar-display">
            {avatarUrl ? (
                <img 
                    src={avatarUrl} 
                    alt="User Avatar" 
                    className="avatar-image-circle"
                />
            ) : (
                <span className="avatar-initials">
                    {/* FIX: Explicitly use FaUser for the ultimate fallback icon 
                        when no name is available, otherwise use initials */}
                    {user?.name ? getInitials(user.name) : <FaUser />} 
                </span>
            )}
        </div>
    );
  };
  
  // --- Conditional Nav Item Renderer (FIXED Type Safety) ---
  const renderNavItem = (item: NavItem) => {
    const isDropdown = 'children' in item && item.children;
    const isActive = isDropdown 
      ? (item as NavDropdownItem).children.some(child => pathname.startsWith(child.pathname)) 
      : pathname === (item as NavLinkItem).pathname;

    const linkContent = (
      // FIX: Use a dedicated container for link content to manage layout
      <div className="nav-button-content">
        <span className="nav-icon">{item.icon}</span>
        <span className="nav-label">{item.label}</span>
        {isDropdown && (
          <span className={`nav-arrow ${openDropdowns[item.key] ? 'open' : ''}`}>
            <FaChevronRight />
          </span>
        )}
      </div>
    );

    if (isDropdown) {
      const dropdownItem = item as NavDropdownItem;
      const isDropdownOpen = openDropdowns[item.key];

      return (
        <li key={item.key} className="nav-item">
          <button // Use button for dropdown interaction
            className={`nav-button ${isActive ? 'active' : ''}`}
            onClick={() => {
              closeMobileMenu?.();
              toggleDropdown(item.key);
            }}
          >
            {linkContent}
          </button>
          
          <ul className={`nav-submenu ${isDropdownOpen ? 'open' : ''}`}>
            {dropdownItem.children.filter(child => hasPermission(child.key)).map((child) => (
              <li key={child.key}>
                <Link
                  to={child.pathname}
                  className={`nav-sub-link ${pathname === child.pathname ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      );
    }

    const linkItem = item as NavLinkItem; 

    return (
      <li key={item.key} className="nav-item">
        <Link // Use Link for navigation to a specific page
          to={linkItem.pathname}
          className={`nav-button ${isActive ? 'active' : ''}`}
          onClick={closeMobileMenu}
        >
          {linkContent}
        </Link>
      </li>
    );
  };
  
  // --- Component Rendering ---
  if (authLoading || loadingPermissions) {
    return (
      <aside className="custom-sidebar loading">
        <FaSpinner className="spinner" />
        <p>Loading...</p>
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
          {settings?.companyName || 'Firmaplex Admin'}
        </p>
      </div>

      <nav className="sidebar-nav">
        {accessibleLinks.length > 0 ? (
          <ul className="nav-list">
            {accessibleLinks.map(renderNavItem)}
          </ul>
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
          }`}
          onClick={closeMobileMenu}
        >
          <AvatarDisplay /> 
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