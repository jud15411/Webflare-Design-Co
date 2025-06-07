// api.js - Functions for Interacting with AWS API Gateway & Lambda

const API_GATEWAY_ENDPOINT = 'YOUR_API_GATEWAY_ENDPOINT'; // e.g., 'https://xxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod'

/**
 * Makes a generic authenticated request to the API Gateway.
 * @param {string} method HTTP method (GET, POST, PUT, DELETE).
 * @param {string} path API path (e.g., '/items').
 * @param {object} [body] Request body for POST/PUT requests.
 * @returns {Promise<object>} Promise resolving with API response.
 */
async function apiRequest(method, path, body = null) {
    const idToken = localStorage.getItem('idToken');
    if (!idToken) {
        console.error('User not authenticated. Cannot make API request.');
        // Potentially redirect to login or show error
        return { success: false, error: 'User not authenticated.' };
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
    };

    const options = {
        method: method,
        headers: headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_GATEWAY_ENDPOINT}${path}`, options);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }
        
        return { success: true, data };
    } catch (error) {
        console.error('API request error:', error);
        return { success: false, error: error.message };
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
