const { GetCommand, TransactWriteCommand } = require('@aws-sdk/lib-dynamodb');

const ACTIVE_TABLE = "DBActiveSessions";
const HISTORY_TABLE = "DBSessionHistory";

async function endAndSaveSession(event, docClient) {
    let body;
    try {
        body = JSON.parse(event.body || '{}');
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Invalid JSON in request body.'
            })
        };
    }
    
    if (!body.UserId || !body.SessionId) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Missing UserId or SessionId in request body.'
            })
        };
    }

    try {
        const getResult = await docClient.send(new GetCommand({
            TableName: ACTIVE_TABLE,
            Key: {
                UserId: body.UserId,
                SessionId: body.SessionId
            }
        }));
        const currentSession = getResult.Item;

        if (!currentSession) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'Session not found.'
                })
            };
        }

        const endTime = new Date().toISOString();
        const sessionHistoryItem = {
            UserId: body.UserId,
            SessionId: body.SessionId,
            Exercises: currentSession.Exercises || {},
            startTime: currentSession.startTime,
            endTime: endTime,
            TimeToExist: Math.floor(Date.now() / 1000) + (30 * 24 * 3600)
        };

        await docClient.send(new TransactWriteCommand({
            TransactItems: [
                {
                   Put: {
                       TableName: HISTORY_TABLE,
                       Item: sessionHistoryItem
                    } 
                },
                {
                    Delete: {
                        TableName: ACTIVE_TABLE,
                        Key: {
                            UserId: body.UserId,
                            SessionId: body.SessionId
                        },
                        ConditionExpression: 'attribute_exists(UserId) AND attribute_exists(SessionId)'
                    }
                }
            ]
        }));

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Session ended and saved to history.',
                SessionId: body.SessionId
            })
        };


    } catch (error) {
        if (error.name === 'ConditionalCheckFailedException') {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'Session not found or already ended.'
                })
            };
        }

        console.error('Error ending and saving session:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error.'
            })
        };
    }
}

module.exports = { endAndSaveSession };