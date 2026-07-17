import { APIGatewayProxyResult } from "aws-lambda";
import { withValidatedBodyRequest } from "../../shared/middleware/handler-wrapper.middleware.js";
import type { ValidatedEvent } from "../../shared/types/events.js";
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

export const handler = withValidatedBodyRequest(
    deleteSetSchema,
    deleteSetHandler,
);
