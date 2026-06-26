import { addSetSchema } from "./add-set.schema.js";
import { validateRequest } from "../helpers/validation.helper.js";
import { addSetLogic } from "./add-set.helper.js";
import { parseBody } from "../helpers/parse-body.helper.js";

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

    const validationErrors = await validateRequest(addSetSchema, body);

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
        await addSetLogic(
            body.userId,
            body.sessionId,
            body.exerciseName,
            body.setData,
        );

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Set added successfully.",
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
