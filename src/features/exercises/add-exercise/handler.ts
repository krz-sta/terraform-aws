import { APIGatewayProxyResult } from "aws-lambda";
import { errorHandler } from "../../shared/middleware/error.middleware.js";
import { logger } from "../../shared/middleware/logger.middleware.js";
import {
    validateRequest,
    ValidatedEvent,
} from "../../shared/middleware/validation.middleware.js";
import middy from "@middy/core";
import { parser } from "../../shared/middleware/parser.middleware.js";
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

export const handler = middy<
    ValidatedEvent<AddExerciseRequest>,
    APIGatewayProxyResult
>()
    .use(logger())
    .use(parser())
    .use(validateRequest(addExerciseSchema))
    .use(errorHandler())
    .handler(addExerciseHandler);
