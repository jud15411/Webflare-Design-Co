import React from 'react';

// --- Define the props for the component ---
interface NavDropdownProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  closeMobileMenu?: () => void;
  isOpen: boolean;
  toggleDropdown: () => void;
}

export const NavDropdown: React.FC<NavDropdownProps> = ({
  title,
  icon,
  children,
  closeMobileMenu,
  isOpen,
  toggleDropdown,
}) => {
  const handleToggle = (e: React.MouseEvent) => {
    if (closeMobileMenu) {
      e.stopPropagation();
    }
    toggleDropdown();
  };

  const handleLinkClick = () => {
    if (closeMobileMenu) {
      closeMobileMenu();
    }
  };

  return (
    <div className="nav-dropdown">
      <div className="nav-dropdown-toggle" onClick={handleToggle}>
        <span>
          {icon} {title}
        </span>
        <span className={`arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </div>
      {isOpen && (
        <div className="nav-dropdown-menu">
          {React.Children.map(children, (child) =>
            React.cloneElement(child as React.ReactElement<any>, {
              onClick: handleLinkClick,
            })
          )}
        </div>
      )}
    </div>
  );
};
