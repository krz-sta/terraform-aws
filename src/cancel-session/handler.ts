import { validateRequest } from "../helpers/validation.helper.js";
import { cancelSessionLogic } from "./cancel-session.helper.js";
import { cancelSessionSchema } from "./cancel-session.schema.js";
import { APIGatewayProxyEvent } from "aws-lambda/trigger/api-gateway-proxy.js";

export const handler = async (event: APIGatewayProxyEvent) => {
    const params = event?.queryStringParameters || {};

    const validationErrors = await validateRequest(
        cancelSessionSchema as any,
        params,
    );
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
        if (e.name === "ConditionalCheckFailedException") {
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
