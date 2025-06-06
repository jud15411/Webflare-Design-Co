// main.js - Core application logic and event handling

let currentAuthChallenge = null; // To store session info for NEW_PASSWORD_REQUIRED

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    // Check if user is already authenticated (e.g., page refresh)
    if (isAuthenticated()) {
        console.log('User is already authenticated. Showing dashboard.');
        // If on index.html and authenticated, directly show dashboard view
        // This logic will become more complex if index.html serves both login and dashboard SPA-style
        if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/admin/')) {
            showDashboard(); 
        }
    } else {
        console.log('User not authenticated. Login form should be visible.');
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }

    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', handleForgotPassword);
    }

    // Placeholder for sign out button if it's dynamically added by showDashboard()
    // Event delegation might be better if dashboard is complex
    document.body.addEventListener('click', function(event) {
        if (event.target && event.target.id === 'signOutButton' || event.target.matches('button[onclick="handleSignOut()"]')) {
            handleSignOut();
        }
    });
});

async function handleLoginSubmit(event) {
    event.preventDefault();
    hideLoginError(); // Clear previous errors

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    let result;

    if (currentAuthChallenge && currentAuthChallenge.challengeName === 'NEW_PASSWORD_REQUIRED') {
        const newPassword = document.getElementById('newPassword').value;
        if (!newPassword) {
            showLoginError('Please enter your new password.');
            return;
        }
        result = await respondToNewPasswordChallenge(currentAuthChallenge.email, newPassword, currentAuthChallenge.session);
    } else {
        result = await signIn(email, password);
    }

    if (result.success) {
        currentAuthChallenge = null;
        hideNewPasswordInput();
        showDashboard(); // Update UI to show dashboard content
    } else {
        if (result.challengeName === 'NEW_PASSWORD_REQUIRED') {
            currentAuthChallenge = { 
                challengeName: result.challengeName, 
                session: result.session,
                email: email // Store email from initial attempt
            };
            showNewPasswordInput();
            showLoginError('A new password is required. Please enter and confirm your new password.');
        } else {
            currentAuthChallenge = null;
            hideNewPasswordInput();
            showLoginError(result.error || 'Login failed. Please check your credentials.');
        }
    }
}

function handleSignOut() {
    signOut(); // From auth.js
    showLoginPage(); // Update UI to show login page
    currentAuthChallenge = null; // Clear any pending challenge state
}

function handleForgotPassword(event) {
    event.preventDefault();
    // Implementation for forgot password (e.g., redirect to Cognito hosted UI or custom flow)
    showLoginError('Forgot password functionality is not yet implemented.');
    // Example: window.location.href = `https://YOUR_COGNITO_DOMAIN/forgotPassword?client_id=${cognitoConfig.ClientId}&response_type=code&redirect_uri=YOUR_REDIRECT_URI`;
}

console.log('main.js loaded');
