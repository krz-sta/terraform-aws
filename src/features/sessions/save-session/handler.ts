import { APIGatewayProxyResult } from "aws-lambda";
import { withValidatedRequest } from "../../shared/middleware/handler-wrapper.middleware.js";
import type { ValidatedEvent } from "../../shared/types/events.js";
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

export const handler = withValidatedRequest(
    saveSessionSchema,
    saveSessionHandler,
);
