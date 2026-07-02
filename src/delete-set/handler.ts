import { validateRequest } from "../helpers/validation.helper.js";
import { deleteSetLogic } from "./delete-set.helper.js";
import { deleteSetSchema } from "./delete-set.schema.js";
import { parseBody } from "../helpers/parse-body.helper.js";
import { APIGatewayProxyEvent } from "aws-lambda/trigger/api-gateway-proxy.js";
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

    const validationErrors = await validateRequest(deleteSetSchema, body);

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
        await deleteSetLogic(
            body.userId,
            body.sessionId,
            body.exerciseName,
            body.setIndex,
        );

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Set deleted successfully.",
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
