// main.js - Core application logic and event handling

let currentAuthChallenge = null; // To store session info for NEW_PASSWORD_REQUIRED
let apiClient = new APIClient();

// Initialize page-specific functionality
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication status
    if (!isAuthenticated()) {
        // If not authenticated and not on login page, redirect to login
        if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/admin/')) {
            window.location.href = 'index.html';
        }
        return;
    }

    // Initialize page-specific components
    initializePage();

    // Set up event listeners
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }

    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', handleForgotPassword);
    }

    // Handle sign out button clicks
    document.body.addEventListener('click', function(event) {
        if (event.target && event.target.id === 'signOutButton' || event.target.matches('button[onclick="handleSignOut()"]')) {
            handleSignOut();
        }
    });
});

function initializePage() {
    const currentPath = window.location.pathname;
    
    // Initialize page-specific components
    switch (true) {
        case currentPath.endsWith('dashboard.html'):
            initializeDashboard();
            break;
        case currentPath.endsWith('contracts.html'):
            initializeContracts();
            break;
        case currentPath.endsWith('projects.html'):
            initializeProjects();
            break;
        case currentPath.endsWith('clients.html'):
            initializeClients();
            break;
        case currentPath.endsWith('invoices.html'):
            initializeInvoices();
            break;
        case currentPath.endsWith('team.html'):
            initializeTeam();
            break;
        case currentPath.endsWith('reports.html'):
            initializeReports();
            break;
    }
}

async function initializeDashboard() {
    try {
        const [contracts, projects, clients] = await Promise.all([
            apiClient.getContracts(),
            apiClient.getProjects(),
            apiClient.getClients()
        ]);
        
        updateDashboardStats({
            totalContracts: contracts.length,
            activeProjects: projects.filter(p => p.status === 'active').length,
            totalClients: clients.length
        });
    } catch (error) {
        showError('Failed to load dashboard data');
    }
}

async function initializeContracts() {
    try {
        const contracts = await apiClient.getContracts();
        populateContractsTable(contracts);
    } catch (error) {
        showError('Failed to load contracts');
    }
}

async function initializeProjects() {
    try {
        const projects = await apiClient.getProjects();
        populateProjectsTable(projects);
    } catch (error) {
        showError('Failed to load projects');
    }
}

async function initializeClients() {
    try {
        const clients = await apiClient.getClients();
        populateClientsTable(clients);
    } catch (error) {
        showError('Failed to load clients');
    }
}

async function initializeInvoices() {
    try {
        const invoices = await apiClient.getInvoices();
        populateInvoicesTable(invoices);
    } catch (error) {
        showError('Failed to load invoices');
    }
}

async function initializeTeam() {
    try {
        const teamMembers = await apiClient.getTeamMembers();
        populateTeamTable(teamMembers);
    } catch (error) {
        showError('Failed to load team members');
    }
}

async function initializeReports() {
    try {
        const [financial, projectStatus, satisfaction, performance] = await Promise.all([
            apiClient.getFinancialReport(),
            apiClient.getProjectStatusReport(),
            apiClient.getClientSatisfactionReport(),
            apiClient.getTeamPerformanceReport()
        ]);
        
        updateReports({
            financial,
            projectStatus,
            satisfaction,
            performance
        });
    } catch (error) {
        showError('Failed to load reports');
    }
}

async function handleLoginSubmit(event) {
    event.preventDefault();
    hideLoginError(); // Clear previous errors

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const loginButton = event.target.closest('form').querySelector('button[type="submit"]');
    const form = event.target;

    if (!role) {
        showLoginError('Please select your role (CEO or CFO).');
        return;
    }

    try {
        loginButton.disabled = true;
        loginButton.textContent = 'Logging in...';

        console.log('Attempting login with:', { email: email.split('@')[0], role });
        
        const result = await signIn(email, password, role);
        console.log('Login result:', result);
        
        if (result.success) {
            console.log('Login successful, storing tokens...');
            // Store tokens and redirect
            const data = result.data;
            localStorage.setItem('idToken', data.AuthenticationResult.IdToken);
            localStorage.setItem('accessToken', data.AuthenticationResult.AccessToken);
            localStorage.setItem('refreshToken', data.AuthenticationResult.RefreshToken);
            localStorage.setItem('userRole', role);
            
            // Get and store user info
            const userInfoParams = {
                AccessToken: data.AuthenticationResult.AccessToken
            };
            
            try {
                const userInfo = await cognito.getUser(userInfoParams).promise();
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
            } catch (error) {
                console.error('Error getting user info:', error);
            }

            console.log('Redirecting to dashboard...');
            window.location.href = 'dashboard.html';
        } else {
            throw new Error(result.error || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showLoginError('Invalid email or password. Please try again.');
        
        // Re-enable the form inputs
        form.reset();
        loginButton.disabled = false;
        loginButton.textContent = 'Login';
    } finally {
        // Ensure button is always enabled
        loginButton.disabled = false;
        loginButton.textContent = 'Login';
    }
}

function handleSignOut() {
    signOut(); // From auth.js
    window.location.href = 'index.html'; // Redirect to login page
    currentAuthChallenge = null; // Clear any pending challenge state
}

function handleForgotPassword(event) {
    event.preventDefault();
    // Implementation for forgot password (e.g., redirect to Cognito hosted UI or custom flow)
    showLoginError('Forgot password functionality is not yet implemented.');
    // Example: window.location.href = `https://YOUR_COGNITO_DOMAIN/forgotPassword?client_id=${cognitoConfig.ClientId}&response_type=code&redirect_uri=YOUR_REDIRECT_URI`;
}

console.log('main.js loaded');
