import { APIGatewayProxyResult } from "aws-lambda";
import { errorHandler } from "../../shared/middleware/error.middleware.js";
import { logger } from "../../shared/middleware/logger.middleware.js";
import {
    validateRequest,
    ValidatedEvent,
} from "../../shared/middleware/validation.middleware.js";
import middy from "@middy/core";
import { parser } from "../../shared/middleware/parser.middleware.js";
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

export const handler = middy<
    ValidatedEvent<DeleteExerciseRequest>,
    APIGatewayProxyResult
>()
    .use(logger())
    .use(parser())
    .use(validateRequest(deleteExerciseSchema))
    .use(errorHandler())
    .handler(deleteExerciseHandler);
