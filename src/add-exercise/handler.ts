import { parseBody } from "../helpers/parse-body.helper.js";
import { addExerciseLogic } from "./add-exercise.helper.js";
import { addExerciseSchema } from "./add-exercise.schema.js";
import { validateRequest } from "../helpers/validation.helper.js";
import { APIGatewayProxyEvent } from "aws-lambda";
import { AppError } from "../helpers/errors.js";

export const handler = async (event: APIGatewayProxyEvent) => {
    const body = parseBody(event.body ?? undefined);
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
    } catch (e: any) {
        if (e instanceof AppError) {
            return {
                statusCode: e.statusCode,
                body: JSON.stringify({
                    message: e.message,
                    ...(e.data && { details: e.data }),
                }),
            };
        }

        console.error("Unhandler error:", e);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Unhandled server error." }),
        };
    }
};
