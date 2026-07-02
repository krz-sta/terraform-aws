import { APIGatewayProxyEvent } from "aws-lambda/trigger/api-gateway-proxy.js";
import { validateRequest } from "../helpers/validation.helper.js";
import { getSessionLogic } from "./get-session.helper.js";
import { getSessionSchema } from "./get-session.schema.js";

export const handler = async (event: APIGatewayProxyEvent) => {
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
        const session = await getSessionLogic(userId!, sessionId!);

        return {
            statusCode: 200,
            body: JSON.stringify(session),
        };
    } catch (e: any) {
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
