import API_CONFIG from './config';

const API_CLIENT = {
    // Authentication
    async signIn(email, password, role) {
        try {
            console.log('Attempting login with:', { email: email.split('@')[0], role }); // Only log email prefix for security
            
            const response = await fetch(`${API_CONFIG.endpoint}/auth/signin`, {
                method: 'POST',
                headers: {
                    ...API_CONFIG.headers,
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
            if (API_CONFIG.errorHandling.showErrors) {
                const errorMessage = error.message || API_CONFIG.errorHandling.errorMessages.serverError;
                throw new Error(errorMessage);
            }
            throw error;
        }
    },
    
    // Helper to get the full API URL
    getApiUrl(endpoint) {
        return `${API_CONFIG.endpoint}${endpoint}`;
    },

    // Contracts
    async getContracts(params = {}) {
        const token = localStorage.getItem('token');
        const queryParams = new URLSearchParams(params).toString();
        
        const response = await fetch(
            `${API_CONFIG.endpoint}${API_CONFIG.endpoints.contracts}?${queryParams}`,
            {
                headers: {
                    ...API_CONFIG.headers,
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
            API_CONFIG.endpoint + API_CONFIG.endpoints.contracts,
            {
                method: 'POST',
                headers: {
                    ...API_CONFIG.headers,
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
            `${API_CONFIG.endpoint}${API_CONFIG.endpoints.contracts}/${contractId}`,
            {
                method: 'PUT',
                headers: {
                    ...API_CONFIG.headers,
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
            `${API_CONFIG.endpoint}${API_CONFIG.endpoints.contracts}/${contractId}`,
            {
                method: 'DELETE',
                headers: {
                    ...API_CONFIG.headers,
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

export default API_CLIENT;
