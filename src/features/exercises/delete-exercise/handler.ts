import { APIGatewayProxyResult } from "aws-lambda";
import { withValidatedBodyRequest } from "../../shared/middleware/handler-wrapper.middleware.js";
import type { ValidatedEvent } from "../../shared/types/events.js";
import { deleteExerciseLogic } from "./delete-exercise.helper.js";
import { deleteExerciseSchema } from "./delete-exercise.schema.js";
import { DeleteExerciseRequest } from "../../shared/types/requests.js";

async function deleteExerciseHandler(
    event: ValidatedEvent<DeleteExerciseRequest>,
): Promise<APIGatewayProxyResult> {
    await deleteExerciseLogic(
        event.validatedBody.userId,
        event.validatedBody.sessionId,
        event.validatedBody.exerciseName,
    );

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Exercise deleted successfully." }),
    };
}

export const handler = withValidatedBodyRequest(
    deleteExerciseSchema,
    deleteExerciseHandler,
);
