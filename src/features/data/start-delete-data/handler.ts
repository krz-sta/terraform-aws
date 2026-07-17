import { APIGatewayProxyResult } from "aws-lambda";
import { withValidatedRequest } from "../../shared/middleware/handler-wrapper.middleware.js";
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

export const handler = withValidatedRequest(
    startDeleteDataSchema,
    startDeleteDataHandler,
);
