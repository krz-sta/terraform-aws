import { APIGatewayProxyResult } from "aws-lambda";
import { withValidatedBodyRequest } from "../../shared/middleware/handler-wrapper.middleware.js";
import type { ValidatedEvent } from "../../shared/types/events.js";
import { addExerciseLogic } from "./add-exercise.helper.js";
import { addExerciseSchema } from "./add-exercise.schema.js";
import { AddExerciseRequest } from "../../shared/types/requests.js";

async function addExerciseHandler(
    event: ValidatedEvent<AddExerciseRequest>,
): Promise<APIGatewayProxyResult> {
    await addExerciseLogic(
        event.validatedBody.userId,
        event.validatedBody.sessionId,
        event.validatedBody.exerciseName,
    );

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Exercise added successfully." }),
    };
}

export const handler = withValidatedBodyRequest(
    addExerciseSchema,
    addExerciseHandler,
);
