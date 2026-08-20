import { withValidatedRequest } from "../../shared/middleware/wrapper.middleware.js";
import type { ValidatedEvent } from "../../shared/types/events.js";
import { StartDeleteDataRequest } from "../../shared/types/requests.js";
import { startDeleteDataSchema } from "./start-delete-data.schema.js";
import { startDeleteDataWorkflow } from "./start-delete-data.helper.js";

async function startDeleteDataHandler(
    event: ValidatedEvent<StartDeleteDataRequest>,
): Promise<unknown> {
    const result = await startDeleteDataWorkflow(event.validatedBody.userId);

    return { statusCode: 202, ...result };
}

export const handler = withValidatedRequest(
    startDeleteDataSchema,
    startDeleteDataHandler,
);
