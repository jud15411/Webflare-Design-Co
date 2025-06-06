// api.js - Functions for Interacting with AWS API Gateway & Lambda

const API_GATEWAY_ENDPOINT = 'YOUR_API_GATEWAY_ENDPOINT'; // e.g., 'https://xxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod'

/**
 * Makes a generic authenticated request to the API Gateway.
 * @param {string} method HTTP method (GET, POST, PUT, DELETE).
 * @param {string} path API path (e.g., '/items').
 * @param {object} [body] Request body for POST/PUT requests.
 * @returns {Promise<object>} Promise resolving with API response.
 */
async functionapiRequest(method, path, body = null) {
    const idToken = getIdToken(); // From auth.js
    if (!idToken) {
        console.error('User not authenticated. Cannot make API request.');
        // Potentially redirect to login or show error
        return { success: false, error: 'User not authenticated.' };
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}` // Or just idToken depending on authorizer setup
    };

    const config = {
        method: method,
        headers: headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_GATEWAY_ENDPOINT}${path}`, config);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            console.error('API request failed:', response.status, errorData);
            return { success: false, status: response.status, error: errorData.message || 'API request error' };
        }
        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error making API request:', error);
        return { success: false, error: error.message || 'Network error or invalid JSON response.' };
    }
}

// Example functions for specific resources (to be expanded)

// --- Clients --- 
async function getClients() {
    return apiRequest('GET', '/clients');
}

async function createClient(clientData) {
    return apiRequest('POST', '/clients', clientData);
}

// --- Projects --- 
async function getProjects() {
    return apiRequest('GET', '/projects');
}

// --- Contracts --- 
async function getContracts() {
    return apiRequest('GET', '/contracts');
}

// --- Invoices --- 
async function getInvoices() {
    return apiRequest('GET', '/invoices');
}

// --- Team Members --- 
async function getTeamMembers() {
    return apiRequest('GET', '/team');
}

console.log('api.js loaded');
