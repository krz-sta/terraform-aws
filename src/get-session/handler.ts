import { APIGatewayProxyEvent } from "aws-lambda";
import { Http } from "../helpers/http.helper.js";
import { getSessionLogic } from "./get-session.helper.js";
import { getSessionSchema } from "./get-session.schema.js";

export const handler = async (event: APIGatewayProxyEvent) => {
    const { errorResponse, data: body } = await Http.parseAndValidate(
        event,
        getSessionSchema,
    );
    if (errorResponse) return errorResponse;

    try {
        const sessionData = await getSessionLogic(body.userId, body.sessionId);

        return Http.success(200, sessionData);
    } catch (e) {
        return Http.error(e);
    }
};
