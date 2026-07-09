import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Http } from "../../shared/helpers/http.helper.js";
import { errorHandler } from "../../shared/middleware/error.middleware.js";
import { deleteSetLogic } from "./delete-set.helper.js";
import { deleteSetSchema } from "./delete-set.schema.js";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";

async function deleteSetHandler(
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
    const { errorResponse, data: body } = await Http.parseAndValidate(
        event,
        deleteSetSchema,
    );
    if (errorResponse) return errorResponse;

    await deleteSetLogic(
        body.userId,
        body.sessionId,
        body.exerciseName,
        body.setIndex,
    );

    return Http.success(200, {
        message: "Set deleted successfully.",
    });
}

export const handler = middy<APIGatewayProxyEvent, APIGatewayProxyResult>()
    .use(httpJsonBodyParser())
    .use(errorHandler())
    .handler(deleteSetHandler);
