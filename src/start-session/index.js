const docClient = require("../helpers/dbClient").docClient;
const { QueryCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const crypto = require("crypto");

module.exports.handler = async (event) => {
    console.log('Logging event:');
    console.log(event);
    let body;
    try {
        body = JSON.parse(event.body);
    } catch (e) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Invalid JSON in request body.'
            })
        };
    }

    if (!body.userId) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Missing userId in request body.'
            })
        };
    }

    try {
        const existing = await docClient.send(new QueryCommand({
            TableName: "DBActiveSessions",
            KeyConditionExpression: 'UserId = :userId',
            ExpressionAttributeValues: {
                ':userId': body.userId
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

        const sessionId = crypto.randomUUID();
        const ttl = Math.floor(Date.now() / 1000) + (8 * 3600); // 8 hours

        await docClient.send(new PutCommand({
            TableName: "DBActiveSessions",
            Item: {
                UserId: body.userId,
                SessionId: sessionId,
                TimeToExist: ttl,
                startTime: new Date().toISOString()
            }
        }));

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: 'Session started successfully.',
                SessionId: sessionId
            })
        };

    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error creating session.'
            })
        };
    }
}