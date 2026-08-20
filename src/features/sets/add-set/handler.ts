import { withValidatedBodyRequest } from "../../shared/middleware/wrapper.middleware.js";
import type { ValidatedEvent } from "../../shared/types/events.js";
import { addSetSchema } from "./add-set.schema.js";
import { addSetLogic } from "./add-set.helper.js";
import { AddSetRequest } from "../../shared/types/requests.js";

async function addSetHandler(
    event: ValidatedEvent<AddSetRequest>,
): Promise<unknown> {
    await addSetLogic(
        event.validatedBody.userId,
        event.validatedBody.sessionId,
        event.validatedBody.exerciseName,
        event.validatedBody.setData,
    );

    return { statusCode: 201, message: "Set added successfully." };
}

export const handler = withValidatedBodyRequest(addSetSchema, addSetHandler);
