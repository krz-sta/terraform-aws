const { getSession, updateSession } = require('../services/dbService');

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

    if (!body.userId || !body.sessionId || !body.exerciseName || !body.setData || typeof body.setIndex !== 'number') {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Missing userId, sessionId, exerciseName, setData or invalid setIndex in request body.'
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

        if (!updatedExercises[exerciseName] || !updatedExercises[exerciseName].Sets[body.setIndex]) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'Exercise or set not found in the session.'
                })
            };
        }

        updatedExercises[exerciseName].Sets[body.setIndex] = body.setData;

        await updateSession(body.userId, body.sessionId, updatedExercises);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Set updated successfully.'
            })
        };
    } catch (e) {
        console.error('Error updating set:', e);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error updating set.'
            })
        };
    }
};