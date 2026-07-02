import { updateSetSchema } from "./update-set.schema.js";
import { validateRequest } from "../helpers/validation.helper.js";
import { updateSetLogic } from "./update-set.helper.js";
import { parseBody } from "../helpers/parse-body.helper.js";
import { APIGatewayProxyEvent } from "aws-lambda/trigger/api-gateway-proxy.js";

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

    const validationErrors = await validateRequest(updateSetSchema, body);

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
        await updateSetLogic(
            body.userId,
            body.sessionId,
            body.exerciseName,
            body.setIndex,
            body.setData,
        );

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Set updated successfully.",
            }),
        };
    } catch (e: any) {
        if (e.message === "SESSION_NOT_FOUND") {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "Session not found.",
                }),
            };
        } else if (e.message === "SET_NOT_FOUND") {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "Set not found in the session.",
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
