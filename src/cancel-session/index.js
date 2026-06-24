const { DeleteCommand } = require("@aws-sdk/client-dynamodb");

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

    const userId = event?.queryStringParameters?.userId;
    const sessionId = event?.queryStringParameters?.sessionId;

    if (!body.userId || !body.sessionId) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Missing userId or sessionId in request body.'
            })
        };
    }

    try {
        await docClient.send(new DeleteCommand({
            TableName: "DBActiveSessions",
            Key: {
                UserId: body.userId,
                SessionId: body.sessionId
            },
            ConditionExpression: 'attribute_exists(SessionId)'
        }));

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Session cancelled successfully.'
            })
        };

    } catch (e) {
        if (e.name === 'ConditionalCheckFailedException') {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'Session not found.'
                })
            };
        }

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error deleting session.',
            })
        }
    }
}