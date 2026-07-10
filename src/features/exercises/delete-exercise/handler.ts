import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Http } from "../../shared/helpers/http.helper.js";
import { errorHandler } from "../../shared/middleware/error.middleware.js";
import { logger } from "../../shared/middleware/logger.middleware.js";
import { deleteExerciseLogic } from "./delete-exercise.helper.js";
import { deleteExerciseSchema } from "./delete-exercise.schema.js";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";

async function deleteExerciseHandler(
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
    const { errorResponse, data: body } = await Http.parseAndValidate(
        event,
        deleteExerciseSchema,
    );
    if (errorResponse) return errorResponse;

    await deleteExerciseLogic(body.userId, body.sessionId, body.exerciseName);

    return Http.success(200, {
        message: "Exercise deleted successfully.",
    });
}

export const handler = middy<APIGatewayProxyEvent, APIGatewayProxyResult>()
    .use(logger())
    .use(httpJsonBodyParser())
    .use(errorHandler())
    .handler(deleteExerciseHandler);
