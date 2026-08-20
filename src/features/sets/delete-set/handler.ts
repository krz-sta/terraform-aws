import { withValidatedBodyRequest } from "../../shared/middleware/wrapper.middleware.js";
import type { ValidatedEvent } from "../../shared/types/events.js";
import { deleteSetLogic } from "./delete-set.helper.js";
import { deleteSetSchema } from "./delete-set.schema.js";
import { DeleteSetRequest } from "../../shared/types/requests.js";

async function deleteSetHandler(
    event: ValidatedEvent<DeleteSetRequest>,
): Promise<unknown> {
    await deleteSetLogic(
        event.validatedBody.userId,
        event.validatedBody.sessionId,
        event.validatedBody.exerciseName,
        event.validatedBody.setIndex,
    );

    return { statusCode: 200, message: "Set deleted successfully." };
}

export const handler = withValidatedBodyRequest(
    deleteSetSchema,
    deleteSetHandler,
);
