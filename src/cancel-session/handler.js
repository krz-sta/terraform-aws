import { validateRequest } from "../helpers/validation.helper.js";
import { cancelSessionLogic } from "./cancel-session.helper.js";

export const handler = async (event) => {
    const params = event?.queryStringParameters || {};

    const validationErrors = await validateRequest(getSessionSchema, params);
    if (validationErrors) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Invalid query parameters.",
                validationErrors,
            }),
        };
    }

    const { userId, sessionId } = params;

    try {
        await cancelSessionLogic(userId, sessionId);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Session cancelled successfully.",
            }),
        };
    } catch (e) {
        if (e.message === "ConditionalCheckFailedException") {
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
