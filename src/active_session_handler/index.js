const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { startSession, cancelSession, getActiveSession } = require('./sessionStartStop');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

module.exports.handler = async (event) => {
    const method = event.httpMethod;
    const path = event.path;

    try {
        if (method === 'POST' && path === '/active-session') {
            return await startSession(event, docClient);
        }

        if (method === 'POST' && path === '/active-session/cancel') {
            return await cancelSession(event, docClient);
        }

        if (method === 'GET' && path === '/active-session') {
            return await getActiveSession(event, docClient);
        }

        return {
            statusCode: 404,
            body: JSON.stringify({
                message: 'Not found.'
            })
        };
        
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error.'
            })
        };
    }
}