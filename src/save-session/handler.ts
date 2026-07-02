import { APIGatewayProxyEvent } from "aws-lambda";
import { Http } from "../helpers/http.helper.js";
import { saveSessionLogic } from "./save-session.helper.js";
import { saveSessionSchema } from "./save-session.schema.js";

export const handler = async (event: APIGatewayProxyEvent) => {
    const { errorResponse, data: body } = await Http.parseAndValidate(
        event,
        saveSessionSchema,
    );
    if (errorResponse) return errorResponse;

    try {
        await saveSessionLogic(body.userId, body.sessionId);

        return Http.success(200, {
            message: "Session ended and saved successfully.",
        });
    } catch (e) {
        return Http.error(e);
    }
};
