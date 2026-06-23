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

        throw error;
    }
}

module.exports = { startSession, cancelSession };