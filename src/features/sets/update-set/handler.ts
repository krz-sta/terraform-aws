import { APIGatewayProxyResult } from "aws-lambda";
import { errorHandler } from "../../shared/middleware/error.middleware.js";
import { logger } from "../../shared/middleware/logger.middleware.js";
import {
    validateRequest,
    ValidatedEvent,
} from "../../shared/middleware/validation.middleware.js";
import middy from "@middy/core";
import { parser } from "../../shared/middleware/parser.middleware.js";
import { updateSetLogic } from "./update-set.helper.js";
import { updateSetSchema } from "./update-set.schema.js";
import { UpdateSetRequest } from "../../shared/types/requests.js";

async function updateSetHandler(
    event: ValidatedEvent<UpdateSetRequest>,
): Promise<APIGatewayProxyResult> {
    await updateSetLogic(
        event.validatedBody.userId,
        event.validatedBody.sessionId,
        event.validatedBody.exerciseName,
        event.validatedBody.setIndex,
        event.validatedBody.setData,
    );

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Set updated successfully." }),
    };
}

export const handler = middy<
    ValidatedEvent<UpdateSetRequest>,
    APIGatewayProxyResult
>()
    .use(logger())
    .use(parser())
    .use(validateRequest(updateSetSchema))
    .use(errorHandler())
    .handler(updateSetHandler);
