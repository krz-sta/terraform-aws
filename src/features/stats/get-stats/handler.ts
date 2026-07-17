import { APIGatewayProxyResult } from "aws-lambda";
import { withValidatedRequest } from "../../shared/middleware/handler-wrapper.middleware.js";
import type { ValidatedEvent } from "../../shared/types/events.js";
import { getStatsLogic } from "./get-stats.helper.js";
import { getStatsSchema } from "./get-stats.schema.js";
import { GetStatsRequest } from "../../shared/types/requests.js";

async function getStatsHandler(
    event: ValidatedEvent<GetStatsRequest>,
): Promise<APIGatewayProxyResult> {
    const statsData = await getStatsLogic(event.validatedBody.userId);

    return {
        statusCode: 200,
        body: JSON.stringify(statsData),
    };
}

export const handler = withValidatedRequest(getStatsSchema, getStatsHandler);
