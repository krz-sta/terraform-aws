import { APIGatewayProxyResult } from "aws-lambda";
import { withValidatedBodyRequest } from "../../shared/middleware/handler-wrapper.middleware.js";
import type { ValidatedEvent } from "../../shared/types/events.js";
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

export const handler = withValidatedBodyRequest(
    updateSetSchema,
    updateSetHandler,
);
