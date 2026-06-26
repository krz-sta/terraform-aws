import { parseBody } from "../helpers/parse-body.helper.js";
import { validateRequest } from "../helpers/validation.helper.js";
import { deleteExerciseLogic } from "./delete-exercise.helper.js";
import { deleteExerciseSchema } from "./delete-exercise.schema.js";

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

    const validationErrors = await validateRequest(deleteExerciseSchema, body);

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
        await deleteExerciseLogic(
            body.userId,
            body.sessionId,
            body.exerciseName,
        );

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Exercise deleted successfully.",
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
        } else if (e.message === "EXERCISE_NOT_FOUND") {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "Exercise not found in the session.",
                }),
            };
        }

        console.error("Unhandled error:", e.message);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Unhandled server error.",
            }),
        };
    }
};
