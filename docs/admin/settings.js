// Mobile menu functionality
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const menuOverlay = document.getElementById('menuOverlay');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    menuOverlay.classList.toggle('active');
});

menuOverlay.addEventListener('click', () => {
    navMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
});

// Define admin roles and their permissions
const ADMIN_ROLES = {
    ceo: {
        name: 'CEO',
        level: 3,
        permissions: ['all']
    },
    cfo: {
        name: 'Chief Financial Officer',
        level: 2,
        permissions: [
            'view_dashboard',
            'view_customers',
            'view_contracts',
            'manage_invoices',
            'view_reports',
            'view_settings'
        ]
    },
    manager: {
        name: 'Manager',
        level: 2,
        permissions: [
            'view_dashboard',
            'manage_customers',
            'manage_contracts',
            'manage_invoices',
            'view_reports',
            'manage_admins'
        ]
    },
    admin: {
        name: 'Admin',
        level: 1,
        permissions: [
            'view_dashboard',
            'manage_customers',
            'manage_contracts',
            'manage_invoices',
            'view_reports'
        ]
    }
};

// Initialize settings page
function initializeSettings() {
    loadCurrentSettings();
    loadAdmins();
    loadAdminUsers();
    setupEventListeners();
    updateUserInfo();
    checkPermissions();
}

// Check user permissions
function checkPermissions() {
    const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin'));
    if (!currentAdmin) return;

    // Hide admin management section for non-CEO users
    const adminSection = document.querySelector('.admin-management-section');
    if (adminSection) {
        adminSection.style.display = currentAdmin.role === 'ceo' ? 'block' : 'none';
    }

    // Hide settings management for non-CEO users
    const settingsSection = document.querySelector('.settings-management-section');
    if (settingsSection) {
        settingsSection.style.display = currentAdmin.role === 'ceo' ? 'block' : 'none';
    }
}

// Load current settings
function loadCurrentSettings() {
    const settings = JSON.parse(localStorage.getItem('settings')) || {
        companyName: 'Webflare Design Co.',
        companyEmail: 'admin@webflare.com',
        companyPhone: '',
        companyAddress: '',
        invoicePrefix: 'INV',
        contractPrefix: 'CON',
        taxRate: 0,
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h'
    };

    // Populate form fields
    document.getElementById('companyName').value = settings.companyName;
    document.getElementById('companyEmail').value = settings.companyEmail;
    document.getElementById('companyPhone').value = settings.companyPhone;
    document.getElementById('companyAddress').value = settings.companyAddress;
    document.getElementById('invoicePrefix').value = settings.invoicePrefix;
    document.getElementById('contractPrefix').value = settings.contractPrefix;
    document.getElementById('taxRate').value = settings.taxRate;
    document.getElementById('currency').value = settings.currency;
    document.getElementById('dateFormat').value = settings.dateFormat;
    document.getElementById('timeFormat').value = settings.timeFormat;
}

// Load admins
function loadAdmins() {
    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    const adminList = document.getElementById('adminList');
    
    if (adminList) {
        adminList.innerHTML = admins.map(admin => `
            <div class="admin-item" data-id="${admin.email}">
                <div class="admin-info">
                    <h3>${admin.name}</h3>
                    <p>${admin.email}</p>
                    <p class="admin-role">${ADMIN_ROLES[admin.role].name}</p>
                    <p class="admin-status">${admin.passwordChanged ? 'Password Changed' : 'Needs Password Change'}</p>
                </div>
                <div class="admin-actions">
                    <button class="btn btn-secondary edit-admin" title="Edit Admin">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger delete-admin" title="Delete Admin">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Check if current user is CEO
function isCEO() {
    const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin'));
    return currentAdmin && currentAdmin.role === 'ceo';
}

// Load admin users
function loadAdminUsers() {
    const adminUsersList = document.getElementById('adminUsersList');
    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    
    // Only show admin users section if current user is CEO
    const adminSection = document.querySelector('.settings-section:last-child');
    if (!isCEO()) {
        adminSection.style.display = 'none';
        return;
    }
    
    adminUsersList.innerHTML = '';
    
    admins.forEach(admin => {
        if (admin.role !== 'ceo') {
            const adminCard = document.createElement('div');
            adminCard.className = 'admin-card';
            adminCard.innerHTML = `
                <div class="admin-info">
                    <h3>${admin.name}</h3>
                    <p>${admin.email}</p>
                    <span class="admin-role">${admin.role}</span>
                </div>
                <div class="admin-actions">
                    <button class="btn btn-warning edit-admin" data-email="${admin.email}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger delete-admin" data-email="${admin.email}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            adminUsersList.appendChild(adminCard);
        }
    });
}

// Add new admin
function addNewAdmin(adminData) {
    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    
    // Check if email already exists
    if (admins.some(admin => admin.email === adminData.email)) {
        showError('An admin with this email already exists');
        return false;
    }
    
    const newAdmin = {
        name: adminData.name,
        email: adminData.email,
        password: adminData.password,
        role: adminData.role,
        passwordChanged: false,
        createdAt: new Date().toISOString()
    };
    
    admins.push(newAdmin);
    localStorage.setItem('admins', JSON.stringify(admins));
    
    // Add activity log
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin'));
    activities.push({
        type: 'admin_add',
        description: `CEO ${currentAdmin.name} added new ${newAdmin.role} ${newAdmin.name}`,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('activities', JSON.stringify(activities));
    
    return true;
}

// Delete admin
function deleteAdmin(email) {
    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    const adminToDelete = admins.find(admin => admin.email === email);
    
    if (!adminToDelete) return false;
    
    const updatedAdmins = admins.filter(admin => admin.email !== email);
    localStorage.setItem('admins', JSON.stringify(updatedAdmins));
    
    // Add activity log
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin'));
    activities.push({
        type: 'admin_delete',
        description: `CEO ${currentAdmin.name} deleted ${adminToDelete.role} ${adminToDelete.name}`,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('activities', JSON.stringify(activities));
    
    return true;
}

// Setup event listeners
function setupEventListeners() {
    // Settings form submission
    document.getElementById('settingsForm').addEventListener('submit', handleSettingsUpdate);
    
    // Password form submission
    document.getElementById('passwordForm').addEventListener('submit', handlePasswordUpdate);
    
    // Admin form submission
    const adminForm = document.getElementById('adminForm');
    if (adminForm) {
        adminForm.addEventListener('submit', handleAdminSubmit);
    }
    
    // Admin list event delegation
    const adminList = document.getElementById('adminList');
    if (adminList) {
        adminList.addEventListener('click', handleAdminActions);
    }
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Add Admin Modal
    const addAdminBtn = document.getElementById('addAdminBtn');
    const addAdminModal = document.getElementById('addAdminModal');
    const cancelAddAdmin = document.getElementById('cancelAddAdmin');
    const confirmAddAdmin = document.getElementById('confirmAddAdmin');
    
    addAdminBtn.addEventListener('click', () => {
        addAdminModal.classList.add('active');
    });
    
    cancelAddAdmin.addEventListener('click', () => {
        addAdminModal.classList.remove('active');
    });
    
    confirmAddAdmin.addEventListener('click', () => {
        const form = document.getElementById('addAdminForm');
        const formData = {
            name: form.adminName.value,
            email: form.adminEmail.value,
            password: form.adminPassword.value,
            role: form.adminRole.value
        };
        
        if (addNewAdmin(formData)) {
            addAdminModal.classList.remove('active');
            form.reset();
            loadAdminUsers();
            showSuccess('Admin user added successfully');
        }
    });
    
    // Delete Admin
    document.addEventListener('click', (e) => {
        if (e.target.closest('.delete-admin')) {
            const email = e.target.closest('.delete-admin').dataset.email;
            if (confirm('Are you sure you want to delete this admin user?')) {
                if (deleteAdmin(email)) {
                    loadAdminUsers();
                    showSuccess('Admin user deleted successfully');
                }
            }
        }
    });
}

// Handle settings update
function handleSettingsUpdate(e) {
    e.preventDefault();
    
    const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin'));
    if (currentAdmin.role !== 'ceo') {
        showError('Only the CEO can update company settings');
        return;
    }
    
    const formData = new FormData(e.target);
    const settings = {
        companyName: formData.get('companyName'),
        companyEmail: formData.get('companyEmail'),
        companyPhone: formData.get('companyPhone'),
        companyAddress: formData.get('companyAddress'),
        invoicePrefix: formData.get('invoicePrefix'),
        contractPrefix: formData.get('contractPrefix'),
        taxRate: parseFloat(formData.get('taxRate')),
        currency: formData.get('currency'),
        dateFormat: formData.get('dateFormat'),
        timeFormat: formData.get('timeFormat')
    };

    localStorage.setItem('settings', JSON.stringify(settings));

    // Add activity
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    activities.push({
        type: 'settings',
        description: 'Company settings updated by CEO',
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('activities', JSON.stringify(activities));

    showNotification('Settings updated successfully');
}

// Handle password update
function handlePasswordUpdate(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Get current admin credentials
    const adminCredentials = JSON.parse(localStorage.getItem('adminCredentials')) || {
        email: 'admin@webflare.com',
        password: 'admin123'
    };
    
    if (currentPassword !== adminCredentials.password) {
        showError('Current password is incorrect');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showError('New passwords do not match');
        return;
    }
    
    // Update password
    adminCredentials.password = newPassword;
    localStorage.setItem('adminCredentials', JSON.stringify(adminCredentials));

    // Add activity
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    activities.push({
        type: 'settings',
        description: 'Admin password updated',
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('activities', JSON.stringify(activities));

    e.target.reset();
    showNotification('Password updated successfully');
}

// Handle admin form submission
function handleAdminSubmit(e) {
    e.preventDefault();
    
    const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin'));
    if (currentAdmin.role !== 'ceo') {
        showError('Only the CEO can manage admin users');
        return;
    }
    
    const formData = new FormData(e.target);
    const adminData = {
        name: formData.get('adminName'),
        email: formData.get('adminEmail'),
        password: formData.get('adminPassword'),
        role: formData.get('adminRole'),
        passwordChanged: false,
        createdAt: new Date().toISOString()
    };

    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    
    // Check if admin already exists
    if (admins.some(a => a.email === adminData.email)) {
        showError('An admin with this email already exists');
        return;
    }

    // Validate role
    if (!ADMIN_ROLES[adminData.role]) {
        showError('Invalid admin role');
        return;
    }

    admins.push(adminData);
    localStorage.setItem('admins', JSON.stringify(admins));

    // Add activity
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    activities.push({
        type: 'admin',
        description: `New ${ADMIN_ROLES[adminData.role].name} "${adminData.name}" created by CEO`,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('activities', JSON.stringify(activities));

    e.target.reset();
    loadAdmins();
    showNotification('Admin added successfully');
}

// Handle admin actions
function handleAdminActions(e) {
    const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin'));
    if (currentAdmin.role !== 'ceo') {
        showError('Only the CEO can manage admin users');
        return;
    }

    const adminItem = e.target.closest('.admin-item');
    if (!adminItem) return;

    const adminEmail = adminItem.dataset.id;
    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    const admin = admins.find(a => a.email === adminEmail);

    if (e.target.closest('.edit-admin')) {
        handleEditAdmin(admin);
    } else if (e.target.closest('.delete-admin')) {
        handleDeleteAdmin(admin);
    }
}

// Handle edit admin
function handleEditAdmin(admin) {
    const form = document.getElementById('adminForm');
    form.adminName.value = admin.name;
    form.adminEmail.value = admin.email;
    form.adminRole.value = admin.role;

    form.dataset.editId = admin.email;
    document.querySelector('.modal-title').textContent = 'Edit Admin';
    document.getElementById('submitAdmin').textContent = 'Update Admin';
}

// Handle delete admin
function handleDeleteAdmin(admin) {
    if (confirm(`Are you sure you want to delete ${ADMIN_ROLES[admin.role].name} "${admin.name}"?`)) {
        const admins = JSON.parse(localStorage.getItem('admins')) || [];
        const updatedAdmins = admins.filter(a => a.email !== admin.email);
        localStorage.setItem('admins', JSON.stringify(updatedAdmins));

        // Add activity
        const activities = JSON.parse(localStorage.getItem('activities')) || [];
        activities.push({
            type: 'admin',
            description: `${ADMIN_ROLES[admin.role].name} "${admin.name}" deleted by CEO`,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('activities', JSON.stringify(activities));

        loadAdmins();
        showNotification('Admin deleted successfully');
    }
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('isAdminLoggedIn');
        localStorage.removeItem('adminLoginTime');
        localStorage.removeItem('currentAdmin');
        localStorage.removeItem('needsPasswordChange');
        window.location.href = 'login.html';
    }
}

// Update user info
function updateUserInfo() {
    const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin')) || { name: 'Judson', role: 'ceo' };
    document.getElementById('userName').textContent = currentAdmin.name;
    document.getElementById('userAvatar').textContent = currentAdmin.name.charAt(0);
    
    // Update role display
    const roleDisplay = document.getElementById('userRole');
    if (roleDisplay) {
        roleDisplay.textContent = ADMIN_ROLES[currentAdmin.role].name;
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Show error message
function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 3000);
}

// Show success message
function showSuccess(message) {
    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.textContent = message;
    document.body.appendChild(successElement);
    
    setTimeout(() => {
        successElement.remove();
    }, 3000);
}

// Initialize page on load
initializeSettings(); 