const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
    region: 'us-east-2'
});

// Create DynamoDB instance
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Authentication middleware
const authenticate = async (event) => {
    const authorization = event.headers.Authorization;
    if (!authorization) {
        throw new Error('Unauthorized: Missing Authorization header');
    }

    // In a real application, you would validate the token with Cognito
    // For now, we'll just check if the token exists
    return true;
};

// Role-based access control
const authorize = async (event, requiredRole) => {
    const token = event.headers.Authorization;
    
    // In a real application, you would get the role from the token
    // For now, we'll just check if the token exists
    if (!token) {
        throw new Error('Unauthorized: Missing Authorization header');
    }
    
    // Check role (in a real app, this would be extracted from the token)
    const userRole = event.requestContext.authorizer.claims['custom:role'];
    if (!userRole || !requiredRole.includes(userRole)) {
        throw new Error(`Forbidden: User role ${userRole} is not authorized`);
    }
    
    return true;
};

// Response helper
const createResponse = (statusCode, body) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(body)
});

module.exports = {
    dynamoDB,
    authenticate,
    authorize,
    createResponse
};
