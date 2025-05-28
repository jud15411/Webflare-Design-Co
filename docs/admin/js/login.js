// Admin Login Module
const AdminLogin = {
    // Initialize login functionality
    init() {
        this.setupEventListeners();
    },

    // Check authentication status
    checkAuth() {
        // No longer automatically redirect if token exists
        // This allows users to manually log in each time
        return !!localStorage.getItem('adminToken');
    },

    // Setup event listeners
    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const togglePassword = document.querySelector('.toggle-password');
        const passwordInput = document.getElementById('password');

        // Toggle password visibility
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.querySelector('i').className = `fas fa-${type === 'password' ? 'eye' : 'eye-slash'}`;
        });

        // Handle login form submission
        loginForm.addEventListener('submit', (e) => this.handleSubmit(e));
    },

    // Handle form submission
    handleSubmit(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Check credentials (for now using hardcoded values)
        if (username === 'ceo' && password === 'ceo2024') {
            const user = {
                username: 'ceo',
                role: 'CEO'
            };
            this.handleSuccessfulLogin(user);
        } else if (username === 'cfo' && password === 'cfo2024') {
            const user = {
                username: 'cfo',
                role: 'CFO'
            };
            this.handleSuccessfulLogin(user);
        } else {
            this.showToast('Login failed. Please check your credentials.', 'error');
            return;
        }
    },

    // Handle successful login
    handleSuccessfulLogin(user) {
        // Generate a mock token
        const token = 'mock-token-' + Date.now();
        
        // Store data in localStorage
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(user));

        // Show success message
        this.showToast('Login successful! Redirecting...', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    },

    // Show toast notification
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="${type === 'success' ? 'fas fa-check-circle' : 'fas fa-times-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        const container = document.getElementById('toastContainer');
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    AdminLogin.init();
}); 