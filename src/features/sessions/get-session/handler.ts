import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Http } from "../../shared/helpers/http.helper.js";
import { errorHandler } from "../../shared/middleware/error.middleware.js";
import { logger } from "../../shared/middleware/logger.middleware.js";
import { getSessionLogic } from "./get-session.helper.js";
import { getSessionSchema } from "./get-session.schema.js";
import middy from "@middy/core";

async function getSessionHandler(
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
    const { errorResponse, data: body } = await Http.parseAndValidate(
        event,
        getSessionSchema,
    );
    if (errorResponse) return errorResponse;

    const sessionData = await getSessionLogic(body.userId, body.sessionId);

    return Http.success(200, sessionData);
}

export const handler = middy<APIGatewayProxyEvent, APIGatewayProxyResult>()
    .use(logger())
    .use(errorHandler())
    .handler(getSessionHandler);
