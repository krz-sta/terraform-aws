import { AppError } from "../helpers/error.helper.js";
import { validateRequest } from "../helpers/validation.helper.js";
import { cancelSessionLogic } from "./cancel-session.helper.js";
import { cancelSessionSchema } from "./cancel-session.schema.js";
import { APIGatewayProxyEvent } from "aws-lambda/trigger/api-gateway-proxy.js";

export const handler = async (event: APIGatewayProxyEvent) => {
    const params = event?.queryStringParameters || {};

    const validationErrors = await validateRequest(cancelSessionSchema, params);
    if (validationErrors && validationErrors.length > 0) {
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
        await cancelSessionLogic(userId!, sessionId!);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Session cancelled successfully.",
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
