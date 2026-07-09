import { APIGatewayProxyEvent } from "aws-lambda/trigger/api-gateway-proxy.js";

export const handler = async (event: APIGatewayProxyEvent) => {
    console.log("Received event:", JSON.stringify(event, null, 2));
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
