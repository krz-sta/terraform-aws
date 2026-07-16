import { APIGatewayProxyResult } from "aws-lambda";
import { errorHandler } from "../../shared/middleware/error.middleware.js";
import { logger } from "../../shared/middleware/logger.middleware.js";
import { validateRequest } from "../../shared/middleware/validation.middleware.js";
import type { ValidatedEvent } from "../../shared/types/events.js";
import middy from "@middy/core";
import { parser } from "../../shared/middleware/parser.middleware.js";
import { addSetSchema } from "./add-set.schema.js";
import { addSetLogic } from "./add-set.helper.js";
import { AddSetRequest } from "../../shared/types/requests.js";

async function addSetHandler(
    event: ValidatedEvent<AddSetRequest>,
): Promise<APIGatewayProxyResult> {
    await addSetLogic(
        event.validatedBody.userId,
        event.validatedBody.sessionId,
        event.validatedBody.exerciseName,
        event.validatedBody.setData,
    );

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Set added successfully." }),
    };
}

export const handler = middy<
    ValidatedEvent<AddSetRequest>,
    APIGatewayProxyResult
>()
    .use(logger())
    .use(parser())
    .use(validateRequest(addSetSchema))
    .use(errorHandler())
    .handler(addSetHandler);
