const { PutCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const crypto = require("crypto");

const TABLE_NAME = "DBActiveSessions";

async function startSession(event, docClient) {
    const body = JSON.parse(event.body || '{}');
    
    if (!body.UserId) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Missing UserId in request body.'
            })
        };
    }

    const SessionId = crypto.randomUUID();

    const TimeToExist = Math.floor(Date.now() / 1000) + (8 * 3600); // 8h
    
    const sessionItem = {
        UserId: body.UserId,
        SessionId: SessionId,
        TimeToExist: TimeToExist,
        startTime: new Date().toISOString()
    };

    try {
        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: sessionItem,
            ConditionExpression: 'attribute_not_exists(UserId)'
        }));

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: 'Session started',
                SessionId: SessionId
            })
        };
    } catch (error) {
        if (error.name === 'ConditionalCheckFailedException') {
            return {
                statusCode: 409,
                body: JSON.stringify({
                    message: 'You can\' have more than one active session.'
                })
            };
        }

        throw error;
    }
}

async function cancelSession(event, docClient) {
    const { UserId, SessionId } = JSON.parse(event.body || '{}');

    if (!UserId || !SessionId) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Missing UserId or SessionId in request body.'
            })
        };
    }

    try {
        await docClient.send(new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { UserId },
            ConditionExpression: 'SessionId = :sessionId',
            ExpressionAttributeValues: {
                ':sessionId': SessionId
            }
        }));

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Session cancelled.'
            })
        };
    } catch (error) {
        if (error.name === 'ConditionalCheckFailedException') {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'Session not found.'
                })
            };
        }

        throw error;
    }
}

module.exports = { startSession, cancelSession };