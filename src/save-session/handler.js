import { parseBody } from "../helpers/parse-body.helper.js";
import { validateRequest } from "../helpers/validation.helper.js";
import { saveSessionLogic } from "./save-session.helper.js";
import { saveSessionSchema } from "./save-session.schema.js";

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

    const validationErrors = await validateRequest(saveSessionSchema, body);

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
        await saveSessionLogic(body.userId, body.sessionId);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Session ended and saved to history.",
                sessionId: body.sessionId,
            }),
        };
    } catch (e) {
        if (e.message === "SESSION_NOT_FOUND") {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "Session not found.",
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
