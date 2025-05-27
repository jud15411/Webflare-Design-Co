// Admin Authentication
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('adminLoginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Check authentication status
    checkAuth();
});

// Login Handler
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Store the token
            localStorage.setItem('adminToken', data.token);
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            errorDiv.textContent = data.message || 'Invalid credentials';
        }
    } catch (error) {
        errorDiv.textContent = 'An error occurred. Please try again.';
    }
}

// Logout Handler
function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem('adminToken');
    window.location.href = 'login.html';
}

// Check Authentication Status
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    const currentPage = window.location.pathname;

    if (!token && !currentPage.includes('login.html')) {
        window.location.href = 'login.html';
    } else if (token && currentPage.includes('login.html')) {
        window.location.href = 'dashboard.html';
    }
}

// Dashboard Functionality
if (document.querySelector('.admin-content')) {
    // Initialize dashboard
    initializeDashboard();
    
    // Add event listeners for buttons
    document.getElementById('addCustomerBtn')?.addEventListener('click', showCustomerModal);
    document.getElementById('addContractBtn')?.addEventListener('click', showContractModal);
    
    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').style.display = 'none';
        });
    });
}

// Initialize Dashboard
async function initializeDashboard() {
    try {
        // Fetch dashboard data
        const [customers, contracts, projects] = await Promise.all([
            fetchCustomers(),
            fetchContracts(),
            fetchProjects()
        ]);

        // Update statistics
        updateDashboardStats(customers, contracts, projects);
        
        // Update lists
        updateCustomerList(customers);
        updateContractList(contracts);
        
        // Update recent activity
        updateRecentActivity();
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}

// Fetch Data Functions
async function fetchCustomers() {
    try {
        const response = await fetch('/api/admin/customers', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching customers:', error);
        return [];
    }
}

async function fetchContracts() {
    try {
        const response = await fetch('/api/admin/contracts', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching contracts:', error);
        return [];
    }
}

async function fetchProjects() {
    try {
        const response = await fetch('/api/admin/projects', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
    }
}

// Update Dashboard UI
function updateDashboardStats(customers, contracts, projects) {
    document.getElementById('totalCustomers').textContent = customers.length;
    document.getElementById('activeContracts').textContent = contracts.length;
    document.getElementById('ongoingProjects').textContent = projects.length;
}

function updateCustomerList(customers) {
    const customerList = document.getElementById('customerList');
    if (!customerList) return;

    customerList.innerHTML = customers.map(customer => `
        <div class="customer-item">
            <div class="customer-info">
                <h3>${customer.name}</h3>
                <p>${customer.email}</p>
                <p>${customer.phone}</p>
            </div>
            <div class="customer-actions">
                <button onclick="editCustomer(${customer.id})" class="edit-btn">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteCustomer(${customer.id})" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function updateContractList(contracts) {
    const contractList = document.getElementById('contractList');
    if (!contractList) return;

    contractList.innerHTML = contracts.map(contract => `
        <div class="contract-item">
            <div class="contract-info">
                <h3>${contract.title}</h3>
                <p>Client: ${contract.clientName}</p>
                <p>Status: ${contract.status}</p>
                <p>Value: $${contract.value}</p>
            </div>
            <div class="contract-actions">
                <button onclick="editContract(${contract.id})" class="edit-btn">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteContract(${contract.id})" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function updateRecentActivity() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;

    // Fetch recent activity from API
    fetch('/api/admin/activity', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
    })
    .then(response => response.json())
    .then(activities => {
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas ${getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-details">
                    <p>${activity.description}</p>
                    <small>${new Date(activity.timestamp).toLocaleString()}</small>
                </div>
            </div>
        `).join('');
    })
    .catch(error => console.error('Error fetching activity:', error));
}

// Modal Functions
function showCustomerModal() {
    const modal = document.getElementById('customerModal');
    modal.style.display = 'block';
}

function showContractModal() {
    const modal = document.getElementById('contractModal');
    modal.style.display = 'block';
}

// Helper Functions
function getActivityIcon(type) {
    const icons = {
        'customer': 'fa-user',
        'contract': 'fa-file-contract',
        'project': 'fa-project-diagram',
        'payment': 'fa-dollar-sign'
    };
    return icons[type] || 'fa-info-circle';
}

// CRUD Operations
async function editCustomer(id) {
    // Implementation for editing customer
}

async function deleteCustomer(id) {
    if (confirm('Are you sure you want to delete this customer?')) {
        try {
            await fetch(`/api/admin/customers/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            initializeDashboard(); // Refresh dashboard
        } catch (error) {
            console.error('Error deleting customer:', error);
        }
    }
}

async function editContract(id) {
    // Implementation for editing contract
}

async function deleteContract(id) {
    if (confirm('Are you sure you want to delete this contract?')) {
        try {
            await fetch(`/api/admin/contracts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            initializeDashboard(); // Refresh dashboard
        } catch (error) {
            console.error('Error deleting contract:', error);
        }
    }
} 