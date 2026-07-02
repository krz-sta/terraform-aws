import { APIGatewayProxyEvent } from "aws-lambda";
import { validateRequest } from "../helpers/validation.helper.js";
import { getStatsLogic } from "./get-stats.helper.js";
import { getStatsSchema } from "./get-stats.schema.js";

export const handler = async (event: APIGatewayProxyEvent) => {
    console.log("Received event:", JSON.stringify(event, null, 2));
    const params = event?.queryStringParameters || {};

    console.log("Validating request parameters:", params);
    const validationErrors = await validateRequest(getStatsSchema, params);
    if (validationErrors) {
        console.log(validationErrors);
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Invalid request parameters",
                validationErrors,
            }),
        };
    }

    try {
        console.log("Executing function logic for userId:", params.userId);
        const stats = await getStatsLogic(params.userId!);

        return {
            statusCode: 200,
            body: JSON.stringify(stats),
        };
    } catch (e) {
        console.error("Unhandled error:", e);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Unhandled server error",
            }),
        };
    }
};
