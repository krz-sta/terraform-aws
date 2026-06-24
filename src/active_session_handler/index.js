const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { startSession, cancelSession, getActiveSession } = require('./sessionStartStop');
const { updateSession } = require('./sessionCRUD');
const { endAndSaveSession } = require('./saveSession');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

module.exports.handler = async (event) => {
    const method = event.httpMethod;
    const path = event.path;

    try {
        if (method === 'PATCH' && path === '/active-session') {
            return await updateSession(event, docClient);
        }

        if (method == 'POST' && path === '/active-session/save') {
            return await endAndSaveSession(event, docClient);
        }
        
        return {
            statusCode: 404,
            body: JSON.stringify({
                message: 'Not found.'
            })
        };
        
    } catch (error) {
        console.error('Error handling request:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error.'
            })
        };
    }
}