import { APIGatewayProxyResult } from "aws-lambda";

export type ResponsePayload = {
    statusCode?: number;
    headers?: Record<string, string>;
    body?: unknown;
} & Record<string, unknown>;

export function responseHandler() {
    return {
        after: function (request: {
            response?: APIGatewayProxyResult | ResponsePayload;
        }): void {
            if (!request.response) {
                request.response = {
                    statusCode: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({}),
                };
                return;
            }

            if (
                typeof request.response === "object" &&
                "statusCode" in request.response &&
                "body" in request.response
            ) {
                return;
            }

            const { statusCode = 200, headers, ...payload } = request.response;

            request.response = {
                statusCode,
                headers: {
                    "Content-Type": "application/json",
                    ...(headers ?? {}),
                },
                body: JSON.stringify(payload),
            };
        },
    };
}
