import { withValidatedRequest } from "../../shared/middleware/wrapper.middleware.js";
import type { ValidatedEvent } from "../../shared/types/events.js";
import { getSessionLogic } from "./get-session.helper.js";
import { getSessionSchema } from "./get-session.schema.js";
import { GetSessionRequest } from "../../shared/types/requests.js";

async function getSessionHandler(
    event: ValidatedEvent<GetSessionRequest>,
): Promise<unknown> {
    const sessionData = await getSessionLogic(
        event.validatedBody.userId,
        event.validatedBody.sessionId,
    );

    return sessionData;
}

export const handler = withValidatedRequest(
    getSessionSchema,
    getSessionHandler,
);
