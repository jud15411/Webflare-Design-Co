const API_CONFIG = {
    endpoint: 'https://ocpajcurpj.execute-api.us-east-2.amazonaws.com/prod/api', // API Gateway endpoint
    
    // API endpoints
    endpoints: {
        contracts: '/api/contracts',
        clients: '/api/clients',
        invoices: '/api/invoices',
        projects: '/api/projects',
        teamMembers: '/api/team'
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
    },
    
    // AWS Configuration
    aws: {
        region: 'us-east-2', // Your AWS region
        stage: 'prod' // Your API Gateway stage
    }
};

window.API_CONFIG = API_CONFIG;
console.log('Config loaded');
