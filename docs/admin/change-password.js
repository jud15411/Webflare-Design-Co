// Check if user is logged in and needs to change password
function checkPasswordChangeStatus() {
    const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin'));
    const needsPasswordChange = localStorage.getItem('needsPasswordChange');
    
    if (!currentAdmin || !needsPasswordChange) {
        window.location.href = 'login.html';
        return;
    }
}

// Handle password change form submission
function handlePasswordChange(e) {
    e.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    if (newPassword.length < 8) {
        showError('Password must be at least 8 characters long');
        return;
    }
    
    // Get all admins
    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin'));
    
    // Update the admin's password
    const adminIndex = admins.findIndex(admin => admin.email === currentAdmin.email);
    if (adminIndex !== -1) {
        admins[adminIndex].password = newPassword;
        admins[adminIndex].passwordChanged = true;
        localStorage.setItem('admins', JSON.stringify(admins));
        
        // Update current admin
        currentAdmin.passwordChanged = true;
        localStorage.setItem('currentAdmin', JSON.stringify(currentAdmin));
        
        // Remove the needs password change flag
        localStorage.removeItem('needsPasswordChange');
        
        // Add activity
        const activities = JSON.parse(localStorage.getItem('activities')) || [];
        activities.push({
            type: 'password',
            description: `Admin ${currentAdmin.name} changed their password`,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('activities', JSON.stringify(activities));
        
        // Redirect to dashboard
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
    document.getElementById('changePasswordForm').addEventListener('submit', handlePasswordChange);
}

// Initialize page
function initializePage() {
    checkPasswordChangeStatus();
    setupEventListeners();
}

// Initialize page on load
initializePage(); 