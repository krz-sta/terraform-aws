import { APIGatewayProxyResult } from "aws-lambda";
import { errorHandler } from "../../shared/middleware/error.middleware.js";
import { logger } from "../../shared/middleware/logger.middleware.js";
import { validateRequest } from "../../shared/middleware/validation.middleware.js";
import type { ValidatedEvent } from "../../shared/types/events.js";
import middy from "@middy/core";
import { cancelSessionLogic } from "./cancel-session.helper.js";
import { cancelSessionSchema } from "./cancel-session.schema.js";
import { CancelSessionRequest } from "../../shared/types/requests.js";

async function cancelSessionHandler(
    event: ValidatedEvent<CancelSessionRequest>,
): Promise<APIGatewayProxyResult> {
    await cancelSessionLogic(
        event.validatedBody.userId,
        event.validatedBody.sessionId,
    );

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Session canceled successfully." }),
    };
}

export const handler = middy<
    ValidatedEvent<CancelSessionRequest>,
    APIGatewayProxyResult
>()
    .use(logger())
    .use(validateRequest(cancelSessionSchema))
    .use(errorHandler())
    .handler(cancelSessionHandler);
