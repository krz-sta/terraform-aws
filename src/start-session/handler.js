import { parseBody } from "../helpers/parse-body.helper.js";
import { startSessionLogic } from "./start-session.helper.js";
import { startSessionSchema } from "./start-session.schema.js";
import { validateRequest } from "../helpers/validation.helper.js";

export const handler = async (event) => {
    const body = parseBody(event.body);
    if (!body) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Invalid JSON in request body.",
            }),
        };
    }

    const validationErrors = await validateRequest(startSessionSchema, body);

    if (validationErrors) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Schema validation failed.",
                validationErrors,
            }),
        };
    }

    try {
        const sessionId = await startSessionLogic(body.userId);

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: "Session started successfully.",
                sessionId,
            }),
        };
    } catch (e) {
        if (e.message === "SESSION_ALREADY_EXISTS") {
            return {
                statusCode: 409,
                body: JSON.stringify({
                    message: "You can't have more than one active session.",
                    sessionId: e.existingSessionId,
                }),
            };
        }

        console.error("Unhandled error:", e);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Unhandled server error.",
            }),
        };
    }
};
