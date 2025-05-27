// Default admin accounts
const defaultAccounts = {
    'ceo': {
        username: 'ceo',
        password: 'ceo2024',
        role: 'CEO'
    },
    'cfo': {
        username: 'cfo',
        password: 'cfo2024',
        role: 'CFO'
    }
};

// Initialize login functionality
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');

    // Check if user is already logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        window.location.href = 'dashboard.html';
    }

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.querySelector('i').className = `fas fa-${type === 'password' ? 'eye' : 'eye-slash'}`;
    });

    // Handle login form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.toLowerCase();
        const password = document.getElementById('password').value;

        // Check credentials
        const account = defaultAccounts[username];
        if (account && account.password === password) {
            // Store user info in localStorage
            const userInfo = {
                username: account.username,
                role: account.role,
                loginTime: new Date().toISOString()
            };
            localStorage.setItem('currentUser', JSON.stringify(userInfo));
            
            // Show success message
            showToast('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            loginError.textContent = 'Invalid username or password';
            loginError.style.display = 'block';
            showToast('Login failed. Please check your credentials.', 'error');
        }
    });
});

// Toast notification function
function showToast(message, type = 'info') {
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