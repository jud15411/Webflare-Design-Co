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

// Initialize customers page
function initializeCustomers() {
    loadCustomers();
    setupEventListeners();
}

// Load customers from localStorage
function loadCustomers() {
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    const customersList = document.getElementById('customersList');
    
    if (customers.length === 0) {
        customersList.innerHTML = '<div class="empty-state">No customers found</div>';
        return;
    }

    customersList.innerHTML = customers.map(customer => `
        <div class="customer-item" data-id="${customer.id}">
            <div class="customer-info">
                <div class="customer-header">
                    <h3>${customer.name}</h3>
                    <span class="status-badge ${customer.status}">${customer.status}</span>
                </div>
                <div class="customer-details">
                    <p><strong>Email:</strong> ${customer.email}</p>
                    <p><strong>Phone:</strong> ${customer.phone}</p>
                    <p><strong>Address:</strong> ${customer.address}</p>
                </div>
            </div>
            <div class="customer-actions">
                <button class="btn btn-secondary edit-customer" title="Edit Customer">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger delete-customer" title="Delete Customer">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Add customer form submission
    document.getElementById('addCustomerForm').addEventListener('submit', handleAddCustomer);
    
    // Customer list event delegation
    document.getElementById('customersList').addEventListener('click', handleCustomerActions);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

// Handle customer form submission
function handleAddCustomer(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const customerData = {
        id: 'CUST' + Date.now(),
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        status: formData.get('status'),
        notes: formData.get('notes'),
        createdAt: new Date().toISOString()
    };

    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    customers.push(customerData);
    localStorage.setItem('customers', JSON.stringify(customers));

    // Add activity
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    activities.push({
        type: 'add',
        description: `New customer "${customerData.name}" added`,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('activities', JSON.stringify(activities));

    e.target.reset();
    loadCustomers();
    showNotification('Customer added successfully');
}

// Handle customer actions (edit, delete)
function handleCustomerActions(e) {
    const customerItem = e.target.closest('.customer-item');
    if (!customerItem) return;

    const customerId = customerItem.dataset.id;
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    const customer = customers.find(c => c.id === customerId);

    if (e.target.closest('.edit-customer')) {
        handleEditCustomer(customer);
    } else if (e.target.closest('.delete-customer')) {
        handleDeleteCustomer(customer);
    }
}

// Handle edit customer
function handleEditCustomer(customer) {
    const form = document.getElementById('addCustomerForm');
    form.name.value = customer.name;
    form.email.value = customer.email;
    form.phone.value = customer.phone;
    form.address.value = customer.address;
    form.status.value = customer.status;
    form.notes.value = customer.notes;

    form.dataset.editId = customer.id;
    document.querySelector('.form-header h2').textContent = 'Edit Customer';
    document.getElementById('submitCustomer').textContent = 'Update Customer';
}

// Handle delete customer
function handleDeleteCustomer(customer) {
    if (confirm(`Are you sure you want to delete customer "${customer.name}"?`)) {
        const customers = JSON.parse(localStorage.getItem('customers')) || [];
        const updatedCustomers = customers.filter(c => c.id !== customer.id);
        localStorage.setItem('customers', JSON.stringify(updatedCustomers));

        // Add activity
        const activities = JSON.parse(localStorage.getItem('activities')) || [];
        activities.push({
            type: 'delete',
            description: `Customer "${customer.name}" deleted`,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('activities', JSON.stringify(activities));

        loadCustomers();
        showNotification('Customer deleted successfully');
    }
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('isAdminLoggedIn');
        localStorage.removeItem('adminLoginTime');
        localStorage.removeItem('currentAdmin');
        window.location.href = 'login.html';
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

// Initialize page on load
initializeCustomers(); 