import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Context,
} from "aws-lambda";

function safeJsonParse(value: string): unknown {
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

export function logger() {
    return {
        before: function (request: {
            event: APIGatewayProxyEvent;
            context: Context;
        }): void {
            console.log("REQUEST", {
                requestId: request.context.awsRequestId,
                httpMethod: request.event.httpMethod,
                path: request.event.path,
                queryStringParameters: request.event.queryStringParameters,
                body: request.event.body,
            });
        },
        after: function (request: {
            response?: APIGatewayProxyResult;
            context: Context;
        }): void {
            console.log("RESPONSE", {
                requestId: request.context.awsRequestId,
                statusCode: request.response?.statusCode,
                body:
                    typeof request.response?.body === "string"
                        ? safeJsonParse(request.response.body)
                        : request.response?.body,
            });
        },
        onError: function (request: {
            error: unknown;
            context: Context;
        }): void {
            console.log("ERROR", {
                requestId: request.context.awsRequestId,
                error: request.error,
            });
        },
    };
}
