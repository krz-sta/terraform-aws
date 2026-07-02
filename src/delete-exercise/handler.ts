import { APIGatewayProxyEvent } from "aws-lambda";
import { parseBody } from "../helpers/parse-body.helper.js";
import { validateRequest } from "../helpers/validation.helper.js";
import { deleteExerciseLogic } from "./delete-exercise.helper.js";
import { deleteExerciseSchema } from "./delete-exercise.schema.js";
import { AppError } from "../helpers/error.helper.js";

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
