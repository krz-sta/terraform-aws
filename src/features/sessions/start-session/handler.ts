import { APIGatewayProxyResult } from "aws-lambda";
import { errorHandler } from "../../shared/middleware/error.middleware.js";
import { logger } from "../../shared/middleware/logger.middleware.js";
import { validateRequest } from "../../shared/middleware/validation.middleware.js";
import type { ValidatedEvent } from "../../shared/types/events.js";
import middy from "@middy/core";
import { startSessionLogic } from "./start-session.helper.js";
import { startSessionSchema } from "./start-session.schema.js";
import { StartSessionRequest } from "../../shared/types/requests.js";

async function startSessionHandler(
    event: ValidatedEvent<StartSessionRequest>,
): Promise<APIGatewayProxyResult> {
    const sessionId = await startSessionLogic(event.validatedBody.userId);

    return {
        statusCode: 200,
        body: JSON.stringify({ sessionId }),
    };
}

export const handler = middy<
    ValidatedEvent<StartSessionRequest>,
    APIGatewayProxyResult
>()
    .use(logger())
    .use(validateRequest(startSessionSchema))
    .use(errorHandler())
    .handler(startSessionHandler);
