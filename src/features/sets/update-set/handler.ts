import { Http } from "../../shared/helpers/http.helper.js";
import { errorHandler } from "../../shared/middleware/error.middleware.js";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { updateSetLogic } from "./update-set.helper.js";
import { updateSetSchema } from "./update-set.schema.js";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";

async function updateSetHandler(
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
    const { errorResponse, data: body } = await Http.parseAndValidate(
        event,
        updateSetSchema,
    );
    if (errorResponse) return errorResponse;

    await updateSetLogic(
        body.userId,
        body.sessionId,
        body.exerciseName,
        body.setIndex,
        body.setData,
    );

    return Http.success(200, {
        message: "Set updated successfully.",
    });
}

export const handler = middy<APIGatewayProxyEvent, APIGatewayProxyResult>()
    .use(httpJsonBodyParser())
    .use(errorHandler())
    .handler(updateSetHandler);
