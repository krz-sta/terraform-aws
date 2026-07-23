import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Context,
} from "aws-lambda";
import { logger } from "../services/logger.service.js";

function loggerMiddleware() {
    return {
        before: function (request: {
            event: APIGatewayProxyEvent;
            context: Context;
        }): void {
            logger.setContext({
                requestId:
                    request.context?.awsRequestId ??
                    request.event.requestContext?.requestId,
                functionName: request.context?.functionName,
            });

            logger.info("Request received", {
                httpMethod: request.event.httpMethod,
                path: request.event.path,
                queryStringParameters: request.event.queryStringParameters,
                body: request.event.body,
            });
        },
        after: function (request: { response?: APIGatewayProxyResult }): void {
            logger.info("Request completed", {
                statusCode: request.response?.statusCode,
                body: request.response?.body,
            });
        },
    };
}
export { loggerMiddleware as logger };
