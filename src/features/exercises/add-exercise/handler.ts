import { addExerciseLogic } from "./add-exercise.helper.js";
import { addExerciseSchema } from "./add-exercise.schema.js";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Http } from "../../shared/helpers/http.helper.js";
import { errorHandler } from "../../shared/middleware/error.middleware.js";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";

async function addExerciseHandler(
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
    const { errorResponse, data: body } = await Http.parseAndValidate(
        event,
        addExerciseSchema,
    );
    if (errorResponse) return errorResponse;

    await addExerciseLogic(body.userId, body.sessionId, body.exerciseName);

    return Http.success(200, {
        message: "Exercise added successfully.",
    });
}

export const handler = middy<APIGatewayProxyEvent, APIGatewayProxyResult>()
    .use(httpJsonBodyParser())
    .use(errorHandler())
    .handler(addExerciseHandler);
