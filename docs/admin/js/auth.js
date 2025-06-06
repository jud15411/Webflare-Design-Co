// auth.js - Amazon Cognito Authentication Logic

// AWS Configuration (to be filled in with your Cognito details)
const cognitoConfig = {
    UserPoolId: 'us-east-2_vffRRRU29', // e.g., 'us-east-1_xxxxxxxxx'
    ClientId: '4dgijq8k4e1gi60hr840nvv5ua',   // e.g., 'xxxxxxxxxxxxxxxxxxxxxx'
    Region: 'us-east-2'         // e.g., 'us-east-1'
};

AWS.config.update({ region: cognitoConfig.Region });

// Initialize CognitoIdentityServiceProvider
const cognito = new AWS.CognitoIdentityServiceProvider({ region: cognitoConfig.Region });

/**
 * Initiates the login process.
 * @param {string} email User's email.
 * @param {string} password User's password.
 * @returns {Promise<object>} Promise resolving with authentication result or error.
 */
async function signIn(email, password) {
    const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: cognitoConfig.ClientId,
        AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
        },
    };

    try {
        const data = await cognito.initiateAuth(params).promise();
        console.log('Sign in successful:', data);
        // Store tokens (e.g., in localStorage or sessionStorage)
        if (data.AuthenticationResult) {
            localStorage.setItem('idToken', data.AuthenticationResult.IdToken);
            localStorage.setItem('accessToken', data.AuthenticationResult.AccessToken);
            localStorage.setItem('refreshToken', data.AuthenticationResult.RefreshToken);
            return { success: true, data };
        } else if (data.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
            // Handle new password required challenge
            return { success: false, challengeName: 'NEW_PASSWORD_REQUIRED', session: data.Session, email };
        }
        return { success: false, error: 'Unknown authentication state.' }; // Should not happen
    } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, error: error.message || 'Sign in failed.' };
    }
}

/**
 * Responds to the NEW_PASSWORD_REQUIRED challenge.
 * @param {string} email User's email (username).
 * @param {string} newPassword The new password chosen by the user.
 * @param {string} session The session string from the NEW_PASSWORD_REQUIRED challenge.
 * @returns {Promise<object>} Promise resolving with authentication result or error.
 */
async function respondToNewPasswordChallenge(email, newPassword, session) {
    const params = {
        ChallengeName: 'NEW_PASSWORD_REQUIRED',
        ClientId: cognitoConfig.ClientId,
        ChallengeResponses: {
            USERNAME: email,
            NEW_PASSWORD: newPassword,
        },
        Session: session,
    };

    try {
        const data = await cognito.respondToAuthChallenge(params).promise();
        console.log('New password set successfully:', data);
        if (data.AuthenticationResult) {
            localStorage.setItem('idToken', data.AuthenticationResult.IdToken);
            localStorage.setItem('accessToken', data.AuthenticationResult.AccessToken);
            localStorage.setItem('refreshToken', data.AuthenticationResult.RefreshToken);
            return { success: true, data };
        }
        return { success: false, error: 'Failed to set new password and authenticate.' }; 
    } catch (error) {
        console.error('Error responding to new password challenge:', error);
        return { success: false, error: error.message || 'Failed to set new password.' };
    }
}

/**
 * Signs the current user out.
 */
function signOut() {
    // Cognito doesn't have a direct 'signOut' that invalidates tokens immediately for USER_PASSWORD_AUTH flow tokens.
    // Global sign out can be used, or simply clear local tokens.
    // For a more robust solution, consider token revocation if using advanced security features.
    localStorage.removeItem('idToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    console.log('User signed out (tokens cleared).');
    // Redirect to login page or update UI
    // window.location.href = 'index.html'; // Or wherever your login page is
}

/**
 * Checks if the user is currently authenticated.
 * @returns {boolean} True if authenticated (ID token exists), false otherwise.
 */
function isAuthenticated() {
    return !!localStorage.getItem('idToken');
}

/**
 * Gets the current user's ID token.
 * @returns {string|null} The ID token or null if not authenticated.
 */
function getIdToken() {
    return localStorage.getItem('idToken');
}

// Add other Cognito functions as needed (e.g., forgotPassword, confirmPassword, signUp, etc.)

console.log('auth.js loaded');
