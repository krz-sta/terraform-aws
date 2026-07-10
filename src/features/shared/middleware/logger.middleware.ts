import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

function safeJsonParse(value: string): unknown {
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

export function logger() {
    return {
        before: function (request: { event: APIGatewayProxyEvent }): void {
            console.log("REQUEST", {
                httpMethod: request.event.httpMethod,
                path: request.event.path,
                queryStringParameters: request.event.queryStringParameters,
                body: request.event.body,
            });
        },
        after: function (request: { response?: APIGatewayProxyResult }): void {
            console.log("RESPONSE", {
                statusCode: request.response?.statusCode,
                body:
                    typeof request.response?.body === "string"
                        ? safeJsonParse(request.response.body)
                        : request.response?.body,
            });
        },
        onError: function (request: { error: unknown }): void {
            console.log("ERROR", {
                error: request.error,
            });
        },
    };
}
