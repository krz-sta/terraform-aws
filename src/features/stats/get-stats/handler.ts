import { withValidatedRequest } from "../../shared/middleware/wrapper.middleware.js";
import type { ValidatedEvent } from "../../shared/types/events.js";
import { getStatsLogic } from "./get-stats.helper.js";
import { getStatsSchema } from "./get-stats.schema.js";
import { GetStatsRequest } from "../../shared/types/requests.js";

async function getStatsHandler(
    event: ValidatedEvent<GetStatsRequest>,
): Promise<unknown> {
    const statsData = await getStatsLogic(event.validatedBody.userId);

    return statsData;
}

export const handler = withValidatedRequest(getStatsSchema, getStatsHandler);
