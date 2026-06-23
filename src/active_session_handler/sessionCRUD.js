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

            case 'ADD_SET':
                if (!exerciseName || !body.NewSet) {
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            message: 'Missing ExerciseName or NewSet for ADD_SET action.'
                        })
                    };
                }

                if (body.NewSet.Weight === undefined || !body.NewSet.Reps) {
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            message: 'NewSet must include Weight and Reps. For bodyweight exercises, set Weight to 0.'
                        })
                    };
                }
                    
                if (!updatedExercises[exerciseName]) {
                    updatedExercises[exerciseName] = { Sets: [] };
                }

                updatedExercises[exerciseName].Sets.push({
                    Weight: body.NewSet.Weight,
                    Reps: body.NewSet.Reps
                });
                break;

            case 'UPDATE_SET':
                if (!exerciseName || body.SetIndex === undefined || !body.UpdatedSet) {
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            message: 'Missing ExerciseName, SetIndex or UpdatedSet for UPDATE_SET action.'
                        })
                    };
                }

                if (!updatedExercises[exerciseName] || !updatedExercises[exerciseName].Sets[body.SetIndex]) {
                    return {
                        statusCode: 404,
                        body: JSON.stringify({
                            message: 'Exercise or set not found.'
                        })
                    };
                }
                
                if (body.UpdatedSet.Weight === undefined || !body.UpdatedSet.Reps) {
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            message: 'UpdatedSet must include Weight and Reps. For bodyweight exercises, set Weight to 0.'
                        })
                    };
                }

                updatedExercises[exerciseName].Sets[body.SetIndex] = {
                    Weight: body.UpdatedSet.Weight,
                    Reps: body.UpdatedSet.Reps
                };
                break;

            case 'DELETE_EXERCISE':
                if (!exerciseName) {
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            message: 'Missing ExerciseName for DELETE_EXERCISE action.'
                        })
                    };
                }

                if (!updatedExercises[exerciseName]) {
                    return {
                        statusCode: 404,
                        body: JSON.stringify({
                            message: 'Exercise not found.'
                        })
                    };
                }
                    
                delete updatedExercises[exerciseName];
                break;

            case 'DELETE_SET':
                if (!exerciseName || body.SetIndex === undefined) {
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            message: 'Missing ExerciseName or SetIndex for DELETE_SET action.'
                        })
                    };
                }

                if (!updatedExercises[exerciseName] || !updatedExercises[exerciseName].Sets[body.SetIndex]) {
                    return {
                        statusCode: 404,
                        body: JSON.stringify({
                            message: 'Exercise or set not found.'
                        })
                    };
                }

                updatedExercises[exerciseName].Sets.splice(body.SetIndex, 1);
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
                message: `Action: ${body.Action} committed successfully.`,
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