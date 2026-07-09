import { APIGatewayProxyResult } from "aws-lambda";
import { AppError } from "../helpers/error.helper.js";

function isHttpError(
    error: unknown,
): error is { statusCode: number; message: string } {
    return (
        typeof error === "object" &&
        error !== null &&
        "statusCode" in error &&
        typeof (error as { statusCode: unknown }).statusCode === "number" &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
    );
}

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

            if (isHttpError(error)) {
                const statusCode = error.statusCode;

                if (statusCode === 422) {
                    request.response = {
                        statusCode: 400,
                        body: JSON.stringify({ message: "Invalid JSON body." }),
                    };
                    return;
                }

                request.response = {
                    statusCode,
                    body: JSON.stringify({ message: error.message }),
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
