const getSession = require('../services/dbService').getSession;
const updateSession = require('../services/dbService').updateSession;


module.exports.handler = async (event) => {
    let body;
    try {
        body = JSON.parse(event.body || '{}')
    } catch (e) {
        console.error('Error parsing JSON:', e);
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Invalid JSON in request body.'
            })
        };
    }

    if (!body.userId || !body.sessionId || !body.exerciseName) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Missing userId, sessionId or exerciseName in request body.'
            })
        };
    }

    try {
        const currentSession = await getSession(body.userId, body.sessionId);

        if (!currentSession) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'Session not found.'
                })
            };
        }

        let updatedExercises = currentSession.Exercises || {};
        const exerciseName = body.exerciseName;

        if (updatedExercises[exerciseName]) {
            return {
                statusCode: 409,
                body: JSON.stringify({
                    message: 'Exercise already exists in the session.'
                })
            };
        }

        updatedExercises[exerciseName] = { Sets: []};
        await updateSession(body.userId, body.sessionId, updatedExercises);
    } catch (e) {
        console.log('Error adding exercise:', e);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error adding exercise.'
            })
        }
    }
}