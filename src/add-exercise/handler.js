import { parseBody } from "../helpers/parse-body.helper.js";
import { addExerciseLogic } from "./add-exercise.helper.js";
import { addExerciseSchema } from "./add-exercise.schema.js";
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

    const validationErrors = await validateRequest(addExerciseSchema, body);

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
        await addExerciseLogic(body.userId, body.sessionId, body.exerciseName);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Exercise added successfully.",
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
        } else if (e.message === "EXERCISE_ALREADY_EXISTS") {
            return {
                statusCode: 409,
                body: JSON.stringify({
                    message: "Exercise already exists in the session.",
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
