import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Http } from "../../shared/helpers/http.helper.js";
import { errorHandler } from "../../shared/middleware/error.middleware.js";
import { saveSessionLogic } from "./save-session.helper.js";
import { saveSessionSchema } from "./save-session.schema.js";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";

async function saveSessionHandler(
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
    const { errorResponse, data: body } = await Http.parseAndValidate(
        event,
        saveSessionSchema,
    );
    if (errorResponse) return errorResponse;

    await saveSessionLogic(body.userId, body.sessionId);

    return Http.success(200, {
        message: "Session ended and saved successfully.",
    });
}

export const handler = middy<APIGatewayProxyEvent, APIGatewayProxyResult>()
    .use(httpJsonBodyParser())
    .use(errorHandler())
    .handler(saveSessionHandler);
