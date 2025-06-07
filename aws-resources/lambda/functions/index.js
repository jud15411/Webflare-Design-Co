const AWS = require('aws-sdk');
const uuid = require('uuid');

// Initialize DynamoDB
const dynamo = new AWS.DynamoDB.DocumentClient();

// Table names
const TABLES = {
    CONTRACTS: 'webflare-contracts',
    CLIENTS: 'webflare-clients',
    PROJECTS: 'webflare-projects',
    INVOICES: 'webflare-invoices',
    TEAM: 'webflare-team'
};

// Helper function to format response
const formatResponse = (statusCode, body) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(body)
});

// Helper function to get table name
const getTableName = (resource) => {
    switch (resource) {
        case 'contracts': return TABLES.CONTRACTS;
        case 'clients': return TABLES.CLIENTS;
        case 'projects': return TABLES.PROJECTS;
        case 'invoices': return TABLES.INVOICES;
        case 'team': return TABLES.TEAM;
        default: throw new Error(`Unknown resource: ${resource}`);
    }
};

// Main handler
exports.handler = async (event) => {
    try {
        console.log('Event:', JSON.stringify(event, null, 2));
        
        // Extract resource and method
        const { resource, httpMethod } = event;
        const [_, resourceType] = resource.split('/');
        
        // Get table name
        const tableName = getTableName(resourceType);
        
        // Handle different HTTP methods
        switch (httpMethod) {
            case 'GET':
                // Get all items or single item by ID
                if (event.pathParameters && event.pathParameters.id) {
                    const params = {
                        TableName: tableName,
                        Key: { id: event.pathParameters.id }
                    };
                    const result = await dynamo.get(params).promise();
                    return formatResponse(200, result.Item || {});
                } else {
                    const params = {
                        TableName: tableName
                    };
                    const result = await dynamo.scan(params).promise();
                    return formatResponse(200, result.Items || []);
                }
                
            case 'POST':
                // Create new item
                const item = {
                    id: uuid.v4(),
                    ...JSON.parse(event.body),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                const createParams = {
                    TableName: tableName,
                    Item: item
                };
                
                await dynamo.put(createParams).promise();
                return formatResponse(201, item);
                
            case 'PUT':
                // Update item
                if (!event.pathParameters || !event.pathParameters.id) {
                    return formatResponse(400, { error: 'ID is required' });
                }
                
                const updateParams = {
                    TableName: tableName,
                    Key: { id: event.pathParameters.id },
                    UpdateExpression: 'set #data = :data, updatedAt = :updatedAt',
                    ExpressionAttributeNames: {
                        '#data': 'data'
                    },
                    ExpressionAttributeValues: {
                        ':data': JSON.parse(event.body),
                        ':updatedAt': new Date().toISOString()
                    },
                    ReturnValues: 'ALL_NEW'
                };
                
                const result = await dynamo.update(updateParams).promise();
                return formatResponse(200, result.Attributes);
                
            case 'DELETE':
                // Delete item
                if (!event.pathParameters || !event.pathParameters.id) {
                    return formatResponse(400, { error: 'ID is required' });
                }
                
                const deleteParams = {
                    TableName: tableName,
                    Key: { id: event.pathParameters.id }
                };
                
                await dynamo.delete(deleteParams).promise();
                return formatResponse(204, {});
                
            default:
                return formatResponse(405, { error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error:', error);
        return formatResponse(500, { error: error.message });
    }
};
