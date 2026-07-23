import { APIGatewayProxyEvent } from "aws-lambda/trigger/api-gateway-proxy.js";
import { logger } from "../../shared/services/logger.service.js";

export const handler = async (event: APIGatewayProxyEvent) => {
    logger.info("Received event", { event });
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            message: "Status OK.",
        }),
    };
};
