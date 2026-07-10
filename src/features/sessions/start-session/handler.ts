import { Http } from "../../shared/helpers/http.helper.js";
import { errorHandler } from "../../shared/middleware/error.middleware.js";
import { logger } from "../../shared/middleware/logger.middleware.js";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { startSessionLogic } from "./start-session.helper.js";
import { startSessionSchema } from "./start-session.schema.js";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";

async function startSessionHandler(
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
    const { errorResponse, data: body } = await Http.parseAndValidate(
        event,
        startSessionSchema,
    );
    if (errorResponse) return errorResponse;

    const sessionId = await startSessionLogic(body.userId);

    return Http.success(200, { sessionId });
}

export const handler = middy<APIGatewayProxyEvent, APIGatewayProxyResult>()
    .use(logger())
    .use(httpJsonBodyParser())
    .use(errorHandler())
    .handler(startSessionHandler);
