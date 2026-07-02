import { APIGatewayProxyEvent } from "aws-lambda";
import { Http } from "../helpers/http.helper.js";
import { cancelSessionLogic } from "./cancel-session.helper.js";
import { cancelSessionSchema } from "./cancel-session.schema.js";

export const handler = async (event: APIGatewayProxyEvent) => {
    const { errorResponse, data: body } = await Http.parseAndValidate(
        event,
        cancelSessionSchema,
    );
    if (errorResponse) return errorResponse;

    try {
        await cancelSessionLogic(body.userId, body.sessionId);

        return Http.success(200, {
            message: "Session canceled successfully.",
        });
    } catch (e) {
        return Http.error(e);
    }
};
