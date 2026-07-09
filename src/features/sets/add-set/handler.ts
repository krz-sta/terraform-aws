import { Http } from "../../shared/helpers/http.helper.js";
import { addSetSchema } from "./add-set.schema.js";
import { addSetLogic } from "./add-set.helper.js";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";

async function addSetHandler(
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
    const { errorResponse, data: body } = await Http.parseAndValidate(
        event,
        addSetSchema,
    );
    if (errorResponse) return errorResponse;

    try {
        await addSetLogic(
            body.userId,
            body.sessionId,
            body.exerciseName,
            body.setData,
        );

        return Http.success(200, {
            message: "Set added successfully.",
        });
    } catch (e) {
        return Http.error(e);
    }
}

export const handler = middy<APIGatewayProxyEvent, APIGatewayProxyResult>()
    .use(httpJsonBodyParser())
    .handler(addSetHandler);
