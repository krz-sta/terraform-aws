import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Http } from "../../shared/helpers/http.helper.js";
import { errorHandler } from "../../shared/middleware/error.middleware.js";
import { logger } from "../../shared/middleware/logger.middleware.js";
import { getStatsLogic } from "./get-stats.helper.js";
import { getStatsSchema } from "./get-stats.schema.js";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";

async function getStatsHandler(
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
    const { errorResponse, data: body } = await Http.parseAndValidate(
        event,
        getStatsSchema,
    );
    if (errorResponse) return errorResponse;

    const statsData = await getStatsLogic(body.userId);

    return Http.success(200, statsData);
}

export const handler = middy<APIGatewayProxyEvent, APIGatewayProxyResult>()
    .use(logger())
    .use(httpJsonBodyParser())
    .use(errorHandler())
    .handler(getStatsHandler);
