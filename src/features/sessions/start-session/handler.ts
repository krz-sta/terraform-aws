import { withValidatedRequest } from "../../shared/middleware/wrapper.middleware.js";
import type { ValidatedEvent } from "../../shared/types/events.js";
import { startSessionLogic } from "./start-session.helper.js";
import { startSessionSchema } from "./start-session.schema.js";
import { StartSessionRequest } from "../../shared/types/requests.js";

async function startSessionHandler(
    event: ValidatedEvent<StartSessionRequest>,
): Promise<unknown> {
    const sessionId = await startSessionLogic(event.validatedBody.userId);

    return { statusCode: 201, sessionId };
}

export const handler = withValidatedRequest(
    startSessionSchema,
    startSessionHandler,
);
