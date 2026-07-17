import { APIGatewayProxyResult } from "aws-lambda";
import { AppError } from "../helpers/error.helper.js";

export function errorHandler() {
    return {
        onError: function (request: {
            error: unknown;
            response?: APIGatewayProxyResult;
        }): APIGatewayProxyResult | void {
            const { error } = request;

            if (!error) return;

            if (error instanceof AppError) {
                const body: { message: string; details?: unknown } = {
                    message: error.message,
                };

                if (error.data !== undefined) body.details = error.data;

                request.response = {
                    statusCode: error.statusCode,
                    body: JSON.stringify(body),
                };
                return;
            }

            console.error("Unhandled error:", error);
            request.response = {
                statusCode: 500,
                body: JSON.stringify({ message: "Unhandled server error." }),
            };
        },
    };
}
