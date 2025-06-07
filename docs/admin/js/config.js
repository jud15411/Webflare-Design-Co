const API_CONFIG = {
    endpoint: 'https://your-api-id.execute-api.us-east-2.amazonaws.com/prod',
    
    // API endpoints
    endpoints: {
        contracts: '/contracts',
        clients: '/clients',
        invoices: '/invoices',
        projects: '/projects',
        teamMembers: '/team'
    },
    
    // API headers
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    
    // Error handling
    errorHandling: {
        showErrors: true,
        errorMessages: {
            networkError: 'Network error. Please check your internet connection.',
            unauthorized: 'Unauthorized access. Please check your credentials.',
            serverError: 'Server error. Please try again later.'
        }
    }
};

export default API_CONFIG;
