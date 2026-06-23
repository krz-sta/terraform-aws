const { PutCommand, DeleteCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
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

    try {
        const existing = await docClient.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'UserId = :userId',
            ExpressionAttributeValues: {
                ':userId': body.UserId
            }
        }));

        if (existing.Items.length > 0) {
            return {
                statusCode: 409,
                body: JSON.stringify({
                    message: 'You can\'t have more than one active session.',
                    SessionId: existing.Items[0].SessionId
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

        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: sessionItem
        }));

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: 'Session started',
                SessionId: SessionId
            })
        };

    } catch (error) {
        console.error('Error starting session:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error.'
            })
        };
    }
}

async function cancelSession(event, docClient) {
    const { UserId, SessionId } = event?.queryStringParameters || {};
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
            Key: { UserId, SessionId },
            ConditionExpression: 'attribute_exists(UserId)'
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

        console.error('Error cancelling session:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error.'
            })
        };
    }
}

async function getActiveSession(event, docClient) {
    const UserId = event?.queryStringParameters?.UserId;

    if (!UserId) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Missing UserId in request parameters.'
            })
        };
    }

    try {
        const result = await docClient.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'UserId = :userId',
            ExpressionAttributeValues: {
                ':userId': UserId
            }
        }));

        if (result.Items.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'No active session found for this user.'
                })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(result.Items[0])
        };

    } catch (error) {
        console.error('Error getting active session:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error.'
            })
        };
    }
}

module.exports = { startSession, cancelSession, getActiveSession };