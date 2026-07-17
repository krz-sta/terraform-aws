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
                const body =
                    error.data !== undefined
                        ? { message: error.message, details: error.data }
                        : { message: error.message };

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
