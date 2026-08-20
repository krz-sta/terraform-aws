import { withValidatedRequest } from "../../shared/middleware/wrapper.middleware.js";
import type { ValidatedEvent } from "../../shared/types/events.js";
import { cancelSessionLogic } from "./cancel-session.helper.js";
import { cancelSessionSchema } from "./cancel-session.schema.js";
import { CancelSessionRequest } from "../../shared/types/requests.js";

async function cancelSessionHandler(
    event: ValidatedEvent<CancelSessionRequest>,
): Promise<unknown> {
    await cancelSessionLogic(
        event.validatedBody.userId,
        event.validatedBody.sessionId,
    );

    return { statusCode: 200, message: "Session canceled successfully." };
}

export const handler = withValidatedRequest(
    cancelSessionSchema,
    cancelSessionHandler,
);
