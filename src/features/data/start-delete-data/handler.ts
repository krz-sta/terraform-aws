import { APIGatewayProxyResult } from "aws-lambda";
import middy from "@middy/core";
import { errorHandler } from "../../shared/middleware/error.middleware.js";
import { logger } from "../../shared/middleware/logger.middleware.js";
import { validateRequest } from "../../shared/middleware/validation.middleware.js";
import type { ValidatedEvent } from "../../shared/types/events.js";
import { StartDeleteDataRequest } from "../../shared/types/requests.js";
import { startDeleteDataSchema } from "./start-delete-data.schema.js";
import { startDeleteDataWorkflow } from "./start-delete-data.helper.js";

async function startDeleteDataHandler(
    event: ValidatedEvent<StartDeleteDataRequest>,
): Promise<APIGatewayProxyResult> {
    const result = await startDeleteDataWorkflow(event.validatedBody.userId);

    return {
        statusCode: 200,
        body: JSON.stringify(result),
    };
}

export const handler = middy<
    ValidatedEvent<StartDeleteDataRequest>,
    APIGatewayProxyResult
>()
    .use(logger())
    .use(validateRequest(startDeleteDataSchema))
    .use(errorHandler())
    .handler(startDeleteDataHandler);
