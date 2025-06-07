const { dynamoDB, authenticate, authorize, createResponse } = require('../utils');

exports.handler = async (event) => {
    try {
        await authenticate(event);
        
        switch (event.httpMethod) {
            case 'GET':
                if (event.pathParameters && event.pathParameters.contractId) {
                    return await getContract(event);
                }
                return await listContracts(event);
            case 'POST':
                await authorize(event, ['CEO']);
                return await createContract(event);
            case 'PUT':
                await authorize(event, ['CEO']);
                return await updateContract(event);
            case 'DELETE':
                await authorize(event, ['CEO']);
                return await deleteContract(event);
            default:
                return createResponse(400, { message: 'Unsupported method' });
        }
    } catch (error) {
        console.error('Error:', error);
        return createResponse(500, { message: error.message });
    }
};

const getContract = async (event) => {
    const { contractId } = event.pathParameters;
    const result = await dynamoDB.get({
        TableName: 'WebflareContracts',
        Key: { contractId }
    }).promise();
    
    return createResponse(200, result.Item || {});
};

const listContracts = async (event) => {
    const params = {
        TableName: 'WebflareContracts'
    };
    
    if (event.queryStringParameters?.clientId) {
        params.IndexName = 'ClientIdIndex';
        params.KeyConditionExpression = 'ClientId = :clientId';
        params.ExpressionAttributeValues = { ':clientId': event.queryStringParameters.clientId };
    }
    
    if (event.queryStringParameters?.status) {
        params.IndexName = 'StatusIndex';
        params.KeyConditionExpression = 'Status = :status';
        params.ExpressionAttributeValues = { ':status': event.queryStringParameters.status };
    }
    
    const result = await dynamoDB.scan(params).promise();
    return createResponse(200, result.Items || []);
};

const createContract = async (event) => {
    const contract = JSON.parse(event.body);
    
    await dynamoDB.put({
        TableName: 'WebflareContracts',
        Item: {
            contractId: contract.contractId,
            clientId: contract.clientId,
            status: contract.status || 'DRAFT',
            ...contract
        }
    }).promise();
    
    return createResponse(201, { message: 'Contract created successfully' });
};

const updateContract = async (event) => {
    const { contractId } = event.pathParameters;
    const updates = JSON.parse(event.body);
    
    const params = {
        TableName: 'WebflareContracts',
        Key: { contractId },
        UpdateExpression: 'SET #status = :status',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':status': updates.status }
    };
    
    await dynamoDB.update(params).promise();
    return createResponse(200, { message: 'Contract updated successfully' });
};

const deleteContract = async (event) => {
    const { contractId } = event.pathParameters;
    
    await dynamoDB.delete({
        TableName: 'WebflareContracts',
        Key: { contractId }
    }).promise();
    
    return createResponse(200, { message: 'Contract deleted successfully' });
};
