import { withValidatedBodyRequest } from "../../shared/middleware/wrapper.middleware.js";
import type { ValidatedEvent } from "../../shared/types/events.js";
import { addExerciseLogic } from "./add-exercise.helper.js";
import { addExerciseSchema } from "./add-exercise.schema.js";
import { AddExerciseRequest } from "../../shared/types/requests.js";

async function addExerciseHandler(
    event: ValidatedEvent<AddExerciseRequest>,
): Promise<unknown> {
    await addExerciseLogic(
        event.validatedBody.userId,
        event.validatedBody.sessionId,
        event.validatedBody.exerciseName,
    );

    return { statusCode: 201, message: "Exercise added successfully." };
}

export const handler = withValidatedBodyRequest(
    addExerciseSchema,
    addExerciseHandler,
);
