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

// Initialize login page
function initializeLogin() {
    // Check if this is the first time running the app
    const isFirstRun = !localStorage.getItem('admins');
    
    if (isFirstRun) {
        // Set up initial admin (CEO) account
        const initialAdmin = {
            name: 'Judson',
            email: 'judsonwells100@gmail.com',
            password: 'Judson07190715!', // Your original password
            role: 'ceo',
            passwordChanged: true, // Set to true since you've already changed it
            createdAt: new Date().toISOString()
        };
        
        // Store the admin in the admins array
        localStorage.setItem('admins', JSON.stringify([initialAdmin]));
        
        // Set up activity log
        localStorage.setItem('activities', JSON.stringify([]));
    }
    
    setupEventListeners();
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Get admins from localStorage
    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    
    // Find admin with matching email
    const admin = admins.find(a => a.email === email);
    
    if (!admin || admin.password !== password) {
        showError('Invalid email or password');
        return;
    }
    
    // Set current admin
    localStorage.setItem('currentAdmin', JSON.stringify(admin));
    localStorage.setItem('isAdminLoggedIn', 'true');
    localStorage.setItem('adminLoginTime', new Date().toISOString());
    
    // Check if password needs to be changed
    if (!admin.passwordChanged) {
        localStorage.setItem('needsPasswordChange', 'true');
    }
    
    // Add login activity
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    activities.push({
        type: 'login',
        description: `${admin.name} logged in`,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('activities', JSON.stringify(activities));
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
}

// Setup event listeners
function setupEventListeners() {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLogin);
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

// Initialize page on load
initializeLogin(); 