import { APIGatewayProxyResult } from "aws-lambda";
import { errorHandler } from "../../shared/middleware/error.middleware.js";
import { logger } from "../../shared/middleware/logger.middleware.js";
import { validateRequest } from "../../shared/middleware/validation.middleware.js";
import type { ValidatedEvent } from "../../shared/types/events.js";
import middy from "@middy/core";
import { saveSessionLogic } from "./save-session.helper.js";
import { saveSessionSchema } from "./save-session.schema.js";
import { SaveSessionRequest } from "../../shared/types/requests.js";

async function saveSessionHandler(
    event: ValidatedEvent<SaveSessionRequest>,
): Promise<APIGatewayProxyResult> {
    await saveSessionLogic(
        event.validatedBody.userId,
        event.validatedBody.sessionId,
    );

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Session ended and saved successfully.",
        }),
    };
}

export const handler = middy<
    ValidatedEvent<SaveSessionRequest>,
    APIGatewayProxyResult
>()
    .use(logger())
    .use(validateRequest(saveSessionSchema))
    .use(errorHandler())
    .handler(saveSessionHandler);
