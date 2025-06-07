// Role-based access control definitions

// Define page access rules
const PAGE_ACCESS_RULES = {
    'dashboard.html': ['CEO', 'CFO'],
    'contracts.html': ['CEO'],
    'projects.html': ['CEO'],
    'clients.html': ['CEO'],
    'invoices.html': ['CEO', 'CFO'],
    'team.html': ['CEO'],
    'reports.html': ['CEO', 'CFO'],
    'unauthorized.html': ['CEO', 'CFO']
};

/**
 * Checks if the current user has access to the specified page.
 * @param {string} page The page to check access for
 * @param {string} userRole The user's role
 * @returns {boolean} True if user has access, false otherwise
 */
function checkPageAccess(page, userRole) {
    // Allow access to login page regardless of role
    if (page === 'index.html') return true;
    
    // Get the allowed roles for this page
    const allowedRoles = PAGE_ACCESS_RULES[page];
    
    // If no rules defined, deny access
    if (!allowedRoles) return false;
    
    // Check if user's role is in the allowed roles
    return allowedRoles.includes(userRole);
}

/**
 * Gets the current user's role from localStorage.
 * @returns {string|null} The user's role or null if not authenticated
 */
function getCurrentUserRole() {
    return isAuthenticated() ? localStorage.getItem('userRole') : null;
}

/**
 * Redirects unauthorized users to the unauthorized page.
 */
function handleUnauthorizedAccess() {
    window.location.href = 'unauthorized.html';
}

/**
 * Shows or hides elements based on user's role.
 * @param {string} role The user's role
 * @param {string} elementId The ID of the element to show/hide
 * @param {string[]} rolesToShow Array of roles that should see this element
 */
function showElementBasedOnRole(role, elementId, rolesToShow) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = rolesToShow.includes(role) ? 'block' : 'none';
    }
}

/**
 * Initializes role-based access control for the current page.
 */
function initRoleBasedAccess() {
    const currentPage = window.location.pathname.split('/').pop();
    const userRole = getCurrentUserRole();
    
    // Check if user has access to this page
    if (!checkPageAccess(currentPage, userRole)) {
        handleUnauthorizedAccess();
        return;
    }
    
    // Hide/show elements based on role
    switch (currentPage) {
        case 'invoices.html':
            // CFO-specific elements
            showElementBasedOnRole(userRole, 'financeReportsBtn', ['CFO']);
            showElementBasedOnRole(userRole, 'paymentProcessingBtn', ['CFO']);
            break;
        
        case 'dashboard.html':
            // CEO-specific elements
            showElementBasedOnRole(userRole, 'teamManagementBtn', ['CEO']);
            showElementBasedOnRole(userRole, 'projectManagementBtn', ['CEO']);
            break;
    }
}
