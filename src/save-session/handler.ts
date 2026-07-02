import { APIGatewayProxyEvent } from "aws-lambda/trigger/api-gateway-proxy.js";
import { parseBody } from "../helpers/parse-body.helper.js";
import { validateRequest } from "../helpers/validation.helper.js";
import { saveSessionLogic } from "./save-session.helper.js";
import { saveSessionSchema } from "./save-session.schema.js";
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
