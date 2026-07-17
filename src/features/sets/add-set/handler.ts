import { APIGatewayProxyResult } from "aws-lambda";
import { withValidatedBodyRequest } from "../../shared/middleware/handler-wrapper.middleware.js";
import type { ValidatedEvent } from "../../shared/types/events.js";
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

export const handler = withValidatedBodyRequest(addSetSchema, addSetHandler);
