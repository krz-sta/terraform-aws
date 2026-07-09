import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Http } from "../../shared/helpers/http.helper.js";
import { errorHandler } from "../../shared/middleware/error.middleware.js";
import { cancelSessionLogic } from "./cancel-session.helper.js";
import { cancelSessionSchema } from "./cancel-session.schema.js";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";

async function cancelSessionHandler(
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
    const { errorResponse, data: body } = await Http.parseAndValidate(
        event,
        cancelSessionSchema,
    );
    if (errorResponse) return errorResponse;

    await cancelSessionLogic(body.userId, body.sessionId);

    return Http.success(200, {
        message: "Session canceled successfully.",
    });
}

export const handler = middy<APIGatewayProxyEvent, APIGatewayProxyResult>()
    .use(httpJsonBodyParser())
    .use(errorHandler())
    .handler(cancelSessionHandler);
