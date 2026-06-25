import { querySession, putSession } from "../services/dbService.js";
import crypto from "crypto";

export const handler = async (event) => {
    console.log('Logging event:');
    console.log(event);
    let body;
    try {
        body = JSON.parse(event.body);
    } catch (e) {
        console.error('Error parsing JSON:', e);
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Invalid JSON in request body.'
            })
        };
    }

    if (!body.userId) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Missing userId in request body.'
            })
        };
    }

    try {
        const existing = await querySession(body.userId);

        if (existing) {
            return {
                statusCode: 409,
                body: JSON.stringify({
                    message: 'You can\'t have more than one active session.',
                    SessionId: existing.SessionId
                })
            };
        }

        const sessionId = await putSession(body.userId);

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: 'Session started successfully.',
                SessionId: sessionId
            })
        };

    } catch (e) {
        console.error('Error creating session:', e);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error creating session.',
            })
        };
    }
};