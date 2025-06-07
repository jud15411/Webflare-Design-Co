const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const TABLES = {
    CONTRACTS: process.env.CONTRACTS_TABLE,
    PROJECTS: process.env.PROJECTS_TABLE,
    CLIENTS: process.env.CLIENTS_TABLE,
    INVOICES: process.env.INVOICES_TABLE,
    TEAM: process.env.TEAM_TABLE
};

exports.handler = async (event) => {
    try {
        const method = event.httpMethod;
        const path = event.path;
        const body = event.body ? JSON.parse(event.body) : null;
        const user = event.requestContext.authorizer.claims;
        
        // Validate user role
        const userRole = user['custom:role'];
        if (!isValidRole(userRole)) {
            return response(403, { message: 'Unauthorized' });
        }

        // Route requests based on path
        switch (path) {
            case '/contracts':
                return handleContracts(method, body);
            case '/projects':
                return handleProjects(method, body);
            case '/clients':
                return handleClients(method, body);
            case '/invoices':
                return handleInvoices(method, body);
            case '/team':
                return handleTeam(method, body);
            default:
                return response(404, { message: 'Not Found' });
        }
    } catch (error) {
        console.error('Error:', error);
        return response(500, { message: 'Internal Server Error' });
    }
};

// Helper functions
function isValidRole(role) {
    return ['CEO', 'CFO'].includes(role);
}

function response(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(body)
    };
}

// Contracts handlers
async function handleContracts(method, body) {
    switch (method) {
        case 'GET':
            return getContracts();
        case 'POST':
            return createContract(body);
        case 'PUT':
            return updateContract(body);
        case 'DELETE':
            return deleteContract(body.id);
        default:
            return response(405, { message: 'Method Not Allowed' });
    }
}

async function getContracts() {
    const params = { TableName: TABLES.CONTRACTS };
    const result = await ddb.scan(params).promise();
    return response(200, result.Items);
}

async function createContract(contract) {
    const params = {
        TableName: TABLES.CONTRACTS,
        Item: contract
    };
    await ddb.put(params).promise();
    return response(201, contract);
}

async function updateContract(contract) {
    const params = {
        TableName: TABLES.CONTRACTS,
        Key: { contractId: contract.contractId },
        UpdateExpression: 'set #data = :data',
        ExpressionAttributeNames: { '#data': 'data' },
        ExpressionAttributeValues: { ':data': contract.data }
    };
    await ddb.update(params).promise();
    return response(200, contract);
}

async function deleteContract(id) {
    const params = {
        TableName: TABLES.CONTRACTS,
        Key: { contractId: id }
    };
    await ddb.delete(params).promise();
    return response(204, {});
}

// Projects handlers
async function handleProjects(method, body) {
    switch (method) {
        case 'GET':
            return getProjects();
        case 'POST':
            return createProject(body);
        case 'PUT':
            return updateProject(body);
        case 'DELETE':
            return deleteProject(body.id);
        default:
            return response(405, { message: 'Method Not Allowed' });
    }
}

async function getProjects() {
    const params = { TableName: TABLES.PROJECTS };
    const result = await ddb.scan(params).promise();
    return response(200, result.Items);
}

async function createProject(project) {
    const params = {
        TableName: TABLES.PROJECTS,
        Item: project
    };
    await ddb.put(params).promise();
    return response(201, project);
}

async function updateProject(project) {
    const params = {
        TableName: TABLES.PROJECTS,
        Key: { projectId: project.projectId },
        UpdateExpression: 'set #data = :data',
        ExpressionAttributeNames: { '#data': 'data' },
        ExpressionAttributeValues: { ':data': project.data }
    };
    await ddb.update(params).promise();
    return response(200, project);
}

async function deleteProject(id) {
    const params = {
        TableName: TABLES.PROJECTS,
        Key: { projectId: id }
    };
    await ddb.delete(params).promise();
    return response(204, {});
}

// Clients handlers
async function handleClients(method, body) {
    switch (method) {
        case 'GET':
            return getClients();
        case 'POST':
            return createClient(body);
        case 'PUT':
            return updateClient(body);
        case 'DELETE':
            return deleteClient(body.id);
        default:
            return response(405, { message: 'Method Not Allowed' });
    }
}

async function getClients() {
    const params = { TableName: TABLES.CLIENTS };
    const result = await ddb.scan(params).promise();
    return response(200, result.Items);
}

async function createClient(client) {
    const params = {
        TableName: TABLES.CLIENTS,
        Item: client
    };
    await ddb.put(params).promise();
    return response(201, client);
}

async function updateClient(client) {
    const params = {
        TableName: TABLES.CLIENTS,
        Key: { clientId: client.clientId },
        UpdateExpression: 'set #data = :data',
        ExpressionAttributeNames: { '#data': 'data' },
        ExpressionAttributeValues: { ':data': client.data }
    };
    await ddb.update(params).promise();
    return response(200, client);
}

async function deleteClient(id) {
    const params = {
        TableName: TABLES.CLIENTS,
        Key: { clientId: id }
    };
    await ddb.delete(params).promise();
    return response(204, {});
}

// Invoices handlers
async function handleInvoices(method, body) {
    switch (method) {
        case 'GET':
            return getInvoices();
        case 'POST':
            return createInvoice(body);
        case 'PUT':
            return updateInvoice(body);
        case 'DELETE':
            return deleteInvoice(body.id);
        default:
            return response(405, { message: 'Method Not Allowed' });
    }
}

async function getInvoices() {
    const params = { TableName: TABLES.INVOICES };
    const result = await ddb.scan(params).promise();
    return response(200, result.Items);
}

async function createInvoice(invoice) {
    const params = {
        TableName: TABLES.INVOICES,
        Item: invoice
    };
    await ddb.put(params).promise();
    return response(201, invoice);
}

async function updateInvoice(invoice) {
    const params = {
        TableName: TABLES.INVOICES,
        Key: { invoiceId: invoice.invoiceId },
        UpdateExpression: 'set #data = :data',
        ExpressionAttributeNames: { '#data': 'data' },
        ExpressionAttributeValues: { ':data': invoice.data }
    };
    await ddb.update(params).promise();
    return response(200, invoice);
}

async function deleteInvoice(id) {
    const params = {
        TableName: TABLES.INVOICES,
        Key: { invoiceId: id }
    };
    await ddb.delete(params).promise();
    return response(204, {});
}

// Team handlers
async function handleTeam(method, body) {
    switch (method) {
        case 'GET':
            return getTeam();
        case 'POST':
            return createTeamMember(body);
        case 'PUT':
            return updateTeamMember(body);
        case 'DELETE':
            return deleteTeamMember(body.id);
        default:
            return response(405, { message: 'Method Not Allowed' });
    }
}

async function getTeam() {
    const params = { TableName: TABLES.TEAM };
    const result = await ddb.scan(params).promise();
    return response(200, result.Items);
}

async function createTeamMember(member) {
    const params = {
        TableName: TABLES.TEAM,
        Item: member
    };
    await ddb.put(params).promise();
    return response(201, member);
}

async function updateTeamMember(member) {
    const params = {
        TableName: TABLES.TEAM,
        Key: { employeeId: member.employeeId },
        UpdateExpression: 'set #data = :data',
        ExpressionAttributeNames: { '#data': 'data' },
        ExpressionAttributeValues: { ':data': member.data }
    };
    await ddb.update(params).promise();
    return response(200, member);
}

async function deleteTeamMember(id) {
    const params = {
        TableName: TABLES.TEAM,
        Key: { employeeId: id }
    };
    await ddb.delete(params).promise();
    return response(204, {});
}
