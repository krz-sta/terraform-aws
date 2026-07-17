import { APIGatewayProxyResult } from "aws-lambda";
import { withValidatedRequest } from "../../shared/middleware/handler-wrapper.middleware.js";
import type { ValidatedEvent } from "../../shared/types/events.js";
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

export const handler = withValidatedRequest(
    getSessionSchema,
    getSessionHandler,
);
