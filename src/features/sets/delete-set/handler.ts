import { APIGatewayProxyResult } from "aws-lambda";
import { errorHandler } from "../../shared/middleware/error.middleware.js";
import { logger } from "../../shared/middleware/logger.middleware.js";
import { validateRequest } from "../../shared/middleware/validation.middleware.js";
import type { ValidatedEvent } from "../../shared/types/events.js";
import middy from "@middy/core";
import { parser } from "../../shared/middleware/parser.middleware.js";
import { deleteSetLogic } from "./delete-set.helper.js";
import { deleteSetSchema } from "./delete-set.schema.js";
import { DeleteSetRequest } from "../../shared/types/requests.js";

async function deleteSetHandler(
    event: ValidatedEvent<DeleteSetRequest>,
): Promise<APIGatewayProxyResult> {
    await deleteSetLogic(
        event.validatedBody.userId,
        event.validatedBody.sessionId,
        event.validatedBody.exerciseName,
        event.validatedBody.setIndex,
    );

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Set deleted successfully." }),
    };
}

export const handler = middy<
    ValidatedEvent<DeleteSetRequest>,
    APIGatewayProxyResult
>()
    .use(logger())
    .use(parser())
    .use(validateRequest(deleteSetSchema))
    .use(errorHandler())
    .handler(deleteSetHandler);
