import { APIGatewayProxyResult } from "aws-lambda";
import { errorHandler } from "../../shared/middleware/error.middleware.js";
import { logger } from "../../shared/middleware/logger.middleware.js";
import {
    validateRequest,
    ValidatedEvent,
} from "../../shared/middleware/validation.middleware.js";
import middy from "@middy/core";
import { getSessionLogic } from "./get-session.helper.js";
import { getSessionSchema } from "./get-session.schema.js";
import { GetSessionRequest } from "../../shared/types/requests.js";

async function getSessionHandler(
    event: ValidatedEvent<GetSessionRequest>,
): Promise<APIGatewayProxyResult> {
    const sessionData = await getSessionLogic(
        event.validatedBody.userId,
        event.validatedBody.sessionId,
    );

    return {
        statusCode: 200,
        body: JSON.stringify(sessionData),
    };
}

export const handler = middy<
    ValidatedEvent<GetSessionRequest>,
    APIGatewayProxyResult
>()
    .use(logger())
    .use(validateRequest(getSessionSchema))
    .use(errorHandler())
    .handler(getSessionHandler);
