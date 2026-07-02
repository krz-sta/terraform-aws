import { addSetSchema } from "./add-set.schema.js";
import { validateRequest } from "../helpers/validation.helper.js";
import { addSetLogic } from "./add-set.helper.js";
import { parseBody } from "../helpers/parse-body.helper.js";
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
