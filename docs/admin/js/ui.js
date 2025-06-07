// ui.js - UI Manipulation and Dynamic Updates

/**
 * Displays an error message on the login form.
 * @param {string} message The error message to display.
 */
function showLoginError(message) {
    const errorMessageElement = document.getElementById('errorMessage');
    if (errorMessageElement) {
        errorMessageElement.textContent = message;
        errorMessageElement.style.display = 'block';
    }
}

/**
 * Hides the error message on the login form.
 */
function hideLoginError() {
    const errorMessageElement = document.getElementById('errorMessage');
    if (errorMessageElement) {
        errorMessageElement.style.display = 'none';
    }
}

/**
 * Shows the new password input field group.
 */
function showNewPasswordInput() {
    const newPasswordGroup = document.getElementById('newPasswordGroup');
    if (newPasswordGroup) {
        newPasswordGroup.style.display = 'block';
    }
}

/**
 * Hides the new password input field group.
 */
function hideNewPasswordInput() {
    const newPasswordGroup = document.getElementById('newPasswordGroup');
    if (newPasswordGroup) {
        newPasswordGroup.style.display = 'none';
    }
}

/**
 * Updates the UI to a logged-in state (e.g., redirect to dashboard).
 * This is a placeholder and will be expanded significantly.
 */
function showDashboard() {
    // For now, just an alert. Later, this will involve loading dashboard content.
    alert('Login successful! Redirecting to dashboard...');
    // Example: window.location.href = 'dashboard.html'; 
    // Or, dynamically load dashboard content into the current page.
    document.body.innerHTML = '<h1>Welcome to the Admin Dashboard!</h1> <button onclick="handleSignOut()">Sign Out</button>';
}

/**
 * Updates the UI to a logged-out state (e.g., show login form).
 */
function showLoginPage() {
    // This might involve reloading index.html or dynamically rebuilding the login form
    // if the dashboard was loaded into the same page.
    // For simplicity, if we always redirect, this might just be: 
    // window.location.href = 'index.html';
    alert('Signed out. Please log in again.');
    window.location.reload(); // Simple way to get back to initial login state
}


// Add more UI functions as the application grows, e.g.:
// - renderTable(data, columns, targetElementId)
// - openModal(modalId)
// - closeModal(modalId)
// - populateForm(formId, data)
// - clearForm(formId)

/**
 * Displays an error message in the UI.
 * @param {string} message The error message to display.
 */
function showError(message) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'alert alert-danger';
    errorContainer.textContent = message;
    
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.insertBefore(errorContainer, mainContent.firstChild);
        
        // Remove error message after 5 seconds
        setTimeout(() => {
            errorContainer.remove();
        }, 5000);
    }
}

console.log('ui.js loaded');
