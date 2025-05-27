// Check if user is already logged in
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    const loginTime = localStorage.getItem('adminLoginTime');
    
    if (isLoggedIn && loginTime) {
        const loginTimeDate = new Date(loginTime);
        const currentTime = new Date();
        const hoursSinceLogin = (currentTime - loginTimeDate) / (1000 * 60 * 60);
        
        // If logged in for less than 24 hours, check if password change is needed
        if (hoursSinceLogin < 24) {
            const needsPasswordChange = localStorage.getItem('needsPasswordChange');
            if (needsPasswordChange) {
                window.location.href = 'change-password.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        } else {
            // Clear expired login
            localStorage.removeItem('isAdminLoggedIn');
            localStorage.removeItem('adminLoginTime');
            localStorage.removeItem('currentAdmin');
            localStorage.removeItem('needsPasswordChange');
        }
    }
}

// Initialize CEO account if not exists
function initializeCEOAccount() {
    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    const ceoExists = admins.some(admin => admin.role === 'ceo');
    
    if (!ceoExists) {
        const ceoAccount = {
            name: 'Judson Wells',
            email: 'judsonwells100@gmail.com',
            password: 'Judson07190715!',
            role: 'ceo',
            passwordChanged: false,
            createdAt: new Date().toISOString()
        };
        
        admins.push(ceoAccount);
        localStorage.setItem('admins', JSON.stringify(admins));
    }
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Get all admins
    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    const admin = admins.find(a => a.email === email);
    
    if (admin && admin.password === password) {
        handleSuccessfulLogin(admin);
    } else {
        showError('Invalid email or password');
    }
}

// Handle successful login
function handleSuccessfulLogin(admin) {
    // Set login status
    localStorage.setItem('isAdminLoggedIn', 'true');
    localStorage.setItem('adminLoginTime', new Date().toISOString());
    localStorage.setItem('currentAdmin', JSON.stringify(admin));
    
    // Add login activity
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    activities.push({
        type: 'login',
        description: `${admin.role === 'ceo' ? 'CEO' : 'Admin'} ${admin.name} logged in`,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('activities', JSON.stringify(activities));
    
    // Check if password change is needed
    if (!admin.passwordChanged) {
        localStorage.setItem('needsPasswordChange', 'true');
        window.location.href = 'change-password.html';
    } else {
        window.location.href = 'dashboard.html';
    }
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

// Setup event listeners
function setupEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

// Initialize page
function initializeLogin() {
    initializeCEOAccount();
    checkLoginStatus();
    setupEventListeners();
}

// Initialize page on load
initializeLogin(); 