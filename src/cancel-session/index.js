const deleteSession = require("../services/dbService").deleteSession;

module.exports.handler = async (event) => {
    console.log('Logging event:');
    console.log(event);
    
    const userId = event?.queryStringParameters?.userId;
    const sessionId = event?.queryStringParameters?.sessionId;

    if (!userId || !sessionId) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Missing userId or sessionId in request parameters.'
            })
        };
    }

    try {
        await deleteSession(userId, sessionId);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Session cancelled successfully.'
            })
        };

    } catch (e) {
        console.error('Error deleting session:', e);
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