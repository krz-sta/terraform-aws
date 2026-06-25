import { getSession } from "../services/dbService.js";

export const handler = async (event) => {
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
        const session = await getSession(userId, sessionId);

        if (!session) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'Session not found.'
                })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(session)
        };

    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Error getting session.'
            })
        }
    }
};