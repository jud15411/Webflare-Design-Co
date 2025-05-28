// Admin Panel JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const userRole = localStorage.getItem('userRole');
    const username = localStorage.getItem('username');
    const userEmail = localStorage.getItem('userEmail');
    
    if (!userRole || !username || !userEmail) {
        window.location.href = '../login.html';
        return;
    }

    // Get user info
    const user = {
        username: username,
        role: userRole,
        email: userEmail
    };
    
    // Update user info in header
    const profileBtn = document.querySelector('.profile-btn');
    if (profileBtn) {
        profileBtn.innerHTML = `
            <img src="https://ui-avatars.com/api/?name=${user.username}" alt="Profile" class="w-8 h-8 rounded-full">
            <span class="text-sm">${user.username}</span>
        `;
    }

    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('userRole');
            localStorage.removeItem('username');
            localStorage.removeItem('userEmail');
            window.location.href = '../login.html';
        });
    }

    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // Initialize tooltips
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(tooltip => {
        new Tooltip(tooltip);
    });

    // Initialize date pickers
    const dateInputs = document.querySelectorAll('.date-picker');
    dateInputs.forEach(input => {
        new DatePicker(input);
    });

    // Initialize data tables
    const tables = document.querySelectorAll('.data-table');
    tables.forEach(table => {
        new DataTable(table);
    });

    // Handle form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });
});

// Form submission handler
function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    // Get form action and method
    const action = form.getAttribute('action');
    const method = form.getAttribute('method') || 'POST';
    
    // Send request
    fetch(action, {
        method: method,
        body: formData,
        headers: {
            'X-CSRF-Token': localStorage.getItem('csrfToken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('success', 'Action completed successfully');
            if (data.redirect) {
                window.location.href = data.redirect;
            }
        } else {
            showNotification('error', data.message || 'An error occurred');
        }
    })
    .catch(error => {
        showNotification('error', 'An error occurred: ' + error.message);
    });
}

// Notification system
function showNotification(type, message) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} fade-in`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Data table class
class DataTable {
    constructor(table) {
        this.table = table;
        this.init();
    }

    init() {
        this.setupSorting();
        this.setupPagination();
        this.setupFilters();
    }

    setupSorting() {
        const headers = this.table.querySelectorAll('th');
        headers.forEach(header => {
            header.addEventListener('click', () => this.sortColumn(header));
        });
    }

    setupPagination() {
        const pagination = this.table.querySelector('.pagination');
        if (pagination) {
            pagination.addEventListener('click', (e) => {
                if (e.target.classList.contains('page-link')) {
                    this.changePage(e.target.dataset.page);
                }
            });
        }
    }

    setupFilters() {
        const filters = this.table.querySelectorAll('.filter');
        filters.forEach(filter => {
            filter.addEventListener('change', () => this.applyFilters());
        });
    }
}

// Date picker class
class DatePicker {
    constructor(input) {
        this.input = input;
        this.init();
    }

    init() {
        this.input.addEventListener('focus', () => this.showCalendar());
    }

    showCalendar() {
        // Implement calendar UI
    }
}

// Tooltip class
class Tooltip {
    constructor(element) {
        this.element = element;
        this.init();
    }

    init() {
        this.createTooltip();
        this.setupEvents();
    }

    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tooltip';
        this.tooltip.textContent = this.element.getAttribute('data-tooltip');
        document.body.appendChild(this.tooltip);
    }

    setupEvents() {
        this.element.addEventListener('mouseenter', () => this.show());
        this.element.addEventListener('mouseleave', () => this.hide());
    }

    show() {
        this.tooltip.style.display = 'block';
        // Position tooltip
    }

    hide() {
        this.tooltip.style.display = 'none';
    }
}
