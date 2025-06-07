const DEFAULT_API_CONFIG = {
    endpoint: '', // Will be set from config.js
    headers: {
        'Content-Type': 'application/json'
    },
    endpoints: {
        contracts: '/api/contracts',
        projects: '/api/projects',
        clients: '/api/clients',
        invoices: '/api/invoices',
        team: '/api/team'
    }
};

// Make APIClient available globally
window.APIClient = {
    // Authentication
    async signIn(email, password, role) {
        try {
            console.log('Attempting login with:', { email: email.split('@')[0], role }); // Only log email prefix for security
            
            const response = await fetch(`${DEFAULT_API_CONFIG.endpoint}/auth/signin`, {
                method: 'POST',
                headers: {
                    ...DEFAULT_API_CONFIG.headers,
                    'Authorization': `Basic ${btoa(`${email}:${password}`)}`
                },
                body: JSON.stringify({ role })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                const errorMessage = errorData.message || 'Authentication failed';
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            if (!data.token) {
                throw new Error('No token received from server');
            }
            
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', role);
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },
    
    // Helper to get the full API URL
    getApiUrl(endpoint) {
        return `${DEFAULT_API_CONFIG.endpoint}${endpoint}`;
    },

    // Contracts
    async getContracts(params = {}) {
        const token = localStorage.getItem('token');
        const queryParams = new URLSearchParams(params).toString();
        
        const response = await fetch(
            `${DEFAULT_API_CONFIG.endpoint}${DEFAULT_API_CONFIG.endpoints.contracts}?${queryParams}`,
            {
                headers: {
                    ...DEFAULT_API_CONFIG.headers,
                    'Authorization': token
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch contracts');
        }
        
        return response.json();
    },

    async createContract(contract) {
        const token = localStorage.getItem('token');
        
        const response = await fetch(
            DEFAULT_API_CONFIG.endpoint + DEFAULT_API_CONFIG.endpoints.contracts,
            {
                method: 'POST',
                headers: {
                    ...DEFAULT_API_CONFIG.headers,
                    'Authorization': token
                },
                body: JSON.stringify(contract)
            }
        );
        
        if (!response.ok) {
            throw new Error('Failed to create contract');
        }
        
        return response.json();
    },

    async updateContract(contractId, updates) {
        const token = localStorage.getItem('token');
        
        const response = await fetch(
            `${DEFAULT_API_CONFIG.endpoint}${DEFAULT_API_CONFIG.endpoints.contracts}/${contractId}`,
            {
                method: 'PUT',
                headers: {
                    ...DEFAULT_API_CONFIG.headers,
                    'Authorization': token
                },
                body: JSON.stringify(updates)
            }
        );
        
        if (!response.ok) {
            throw new Error('Failed to update contract');
        }
        
        return response.json();
    },

    async deleteContract(contractId) {
        const token = localStorage.getItem('token');
        
        const response = await fetch(
            `${DEFAULT_API_CONFIG.endpoint}${DEFAULT_API_CONFIG.endpoints.contracts}/${contractId}`,
            {
                method: 'DELETE',
                headers: {
                    ...DEFAULT_API_CONFIG.headers,
                    'Authorization': token
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('Failed to delete contract');
        }
        
        return response.json();
    }
};

// Initialize API_CONFIG from config.js if available
if (window.API_CONFIG) {
    Object.assign(DEFAULT_API_CONFIG, window.API_CONFIG);
}

console.log('APIClient initialized');
