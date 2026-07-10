import { APIGatewayProxyResult } from "aws-lambda";
import { errorHandler } from "../../shared/middleware/error.middleware.js";
import { logger } from "../../shared/middleware/logger.middleware.js";
import {
    validateRequest,
    ValidatedEvent,
} from "../../shared/middleware/validation.middleware.js";
import middy from "@middy/core";
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

export const handler = middy<
    ValidatedEvent<GetStatsRequest>,
    APIGatewayProxyResult
>()
    .use(logger())
    .use(validateRequest(getStatsSchema))
    .use(errorHandler())
    .handler(getStatsHandler);
