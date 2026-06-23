const { UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const TABLE_NAME = "DBActiveSessions";

async function updateSession(event, docClient) {
    const body = JSON.parse(event.body || '{}');

    if (!body.UserId || !body.SessionId || !body.Action) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Missing UserId, SessionId or Action in request body.'
            })
        };
    }

    try {
        const currentSession = await docClient.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                UserId: body.UserId,
                SessionId: body.SessionId
            }
        }));

        if (!currentSession.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'Session not found.'
                })
            };
        }

        let updatedExercises = currentSession.Item.Exercises || {};
        const exerciseName = body.ExerciseName;

        switch (body.Action) {
            case 'ADD_EXERCISE':
                if (!exerciseName) {
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            message: 'Missing ExerciseName for ADD_EXERCISE action.'
                        })
                    };
                }

                if (updatedExercises[exerciseName]) {
                    return {
                        statusCode: 409,
                        body: JSON.stringify({
                            message: 'Exercise already exists in the session.'
                        })
                    };
                }
            
                updatedExercises[exerciseName] = { Sets: [] };
                break;

            default:
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        message: 'Invalid action.'
                    })
                };
        }

        await docClient.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: {
                UserId: body.UserId,
                SessionId: body.SessionId
            },
            UpdateExpression: 'SET Exercises = :updatedData',
            ExpressionAttributeValues: {
                ':updatedData': updatedExercises
            }
        }));

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Exercise added successfully.',
                exercises: updatedExercises
            })
        }

    } catch (error) {
        console.error('Error updating session:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error.'
            })
        };
    }
}

module.exports = { updateSession };