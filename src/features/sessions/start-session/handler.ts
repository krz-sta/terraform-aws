import { APIGatewayProxyResult } from "aws-lambda";
import { withValidatedRequest } from "../../shared/middleware/handler-wrapper.middleware.js";
import type { ValidatedEvent } from "../../shared/types/events.js";
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

export const handler = withValidatedRequest(
    startSessionSchema,
    startSessionHandler,
);
