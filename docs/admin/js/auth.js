// auth.js - Amazon Cognito Authentication Logic

// AWS Configuration (to be filled in with your Cognito details)
const COGNITO_CONFIG = {
    userPoolId: 'us-east-2_GT5VLktTP',
    clientId: 'fnkm4tjfmoj2ve71uoptm5bre',   // e.g., 'xxxxxxxxxxxxxxxxxxxxxx'
    region: 'us-east-2'         // e.g., 'us-east-1'
};

// Initialize AWS SDK
AWS.config.update({ region: COGNITO_CONFIG.region });
const cognito = new AWS.CognitoIdentityServiceProvider({ region: COGNITO_CONFIG.region });

/**
 * Initiates the login process.
 * @param {string} email User's email.
 * @param {string} password User's password.
 * @param {string} role User's role.
 * @returns {Promise<object>} Promise resolving with authentication result or error.
 */
async function signIn(email, password, role) {
    try {
        console.log('Starting Cognito authentication...');
        
        // Validate role
        const validRoles = ['CEO', 'CFO'];
        if (!validRoles.includes(role)) {
            throw new Error('Invalid role selected. Please choose either CEO or CFO.');
        }

        const authParams = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: COGNITO_CONFIG.clientId,
            UserPoolId: COGNITO_CONFIG.userPoolId,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            }
        };

        console.log('Sending authentication request to Cognito...');
        const data = await cognito.initiateAuth(authParams).promise();
        console.log('Cognito response received:', data);

        if (data.AuthenticationResult) {
            console.log('Authentication successful, storing tokens...');
            localStorage.setItem('idToken', data.AuthenticationResult.IdToken);
            localStorage.setItem('accessToken', data.AuthenticationResult.AccessToken);
            localStorage.setItem('refreshToken', data.AuthenticationResult.RefreshToken);
            localStorage.setItem('userRole', role);
            
            return { success: true, data };
        } else if (data.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
            console.log('New password required challenge received');
            return { 
                success: false, 
                challengeName: 'NEW_PASSWORD_REQUIRED', 
                session: data.Session,
                email 
            };
        } else {
            throw new Error('Unknown authentication state from Cognito');
        }
    } catch (error) {
        console.error('Cognito authentication error:', error);
        throw error;
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
 * @returns {Promise<void>} Promise that resolves when sign out is complete.
 */
async function signOut() {
    try {
        // Clear all tokens and user info from localStorage
        localStorage.removeItem('idToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('userRole');
        
        // Sign out from Cognito
        const params = {
            ClientId: cognitoConfig.ClientId,
            AccessToken: localStorage.getItem('accessToken')
        };
        
        try {
            await cognito.globalSignOut(params).promise();
            console.log('Global sign out successful');
        } catch (error) {
            console.error('Error during global sign out:', error);
        }
    } catch (error) {
        console.error('Error during sign out:', error);
    }
}

/**
 * Checks if the user is currently authenticated.
 * @returns {boolean} True if authenticated (ID token exists), false otherwise.
 */
function isAuthenticated() {
    return localStorage.getItem('idToken') !== null;
}

/**
 * Gets the current user's role.
 * @returns {string|null} The user's role (CEO or CFO) or null if not authenticated.
 */
function getUserRole() {
    return isAuthenticated() ? localStorage.getItem('userRole') : null;
}

/**
 * Checks if the current user has the specified role.
 * @param {string} requiredRole The role to check for (e.g., 'CEO' or 'CFO')
 * @returns {boolean} True if user has the role, false otherwise.
 */
function hasRole(requiredRole) {
    const userRole = getUserRole();
    return userRole === requiredRole;
}

/**
 * Checks if the current user is a CEO.
 * @returns {boolean} True if user is CEO, false otherwise.
 */
function isCEO() {
    return hasRole('CEO');
}

/**
 * Checks if the current user is a CFO.
 * @returns {boolean} True if user is CFO, false otherwise.
 */
function isCFO() {
    return hasRole('CFO');
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
