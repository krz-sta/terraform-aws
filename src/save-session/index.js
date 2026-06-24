const { getSession, saveSession } = require("../services/dbService");

module.exports.handler = async (event) => {
    let body;
    try {
        body = JSON.parse(event.body || '{}');
    } catch (e) {
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
        const currentSession = await getSession(body.UserId, body.SessionId);

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

        await saveSession(sessionHistoryItem);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Session ended and saved to history.',
                SessionId: body.SessionId
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

        console.error('Error ending session:', e);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error ending session.',
                error: e.message
            })
        };
    }
}