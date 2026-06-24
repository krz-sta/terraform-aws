const docClient = require("../helpers/dbClient").docClient;
const { GetCommand } = require('@aws-sdk/lib-dynamodb');

module.exports.handler = async (event) => {
    console.log('Logging event:');
    console.log(event);

    const userId = event?.queryStringParameters?.userId;
    const sessionId = event?.queryStringParameters?.sessionId;

    if (!userId || !sessionId) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Missing userId or sessionId in query parameters.'
            })
        };
    }

    try {
        const result = await docClient.send(new GetCommand({
            TableName: "DBActiveSessions",
            Key: {
                UserId: userId,
                SessionId: sessionId
            }
        }));

        if (!result.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'Session not found.'
                })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(result.Item)
        };

    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Error getting session.'
            })
        }
    }
}