import { Http } from "../../shared/helpers/http.helper.js";
import { APIGatewayProxyEvent } from "aws-lambda";
import { startSessionLogic } from "./start-session.helper.js";
import { startSessionSchema } from "./start-session.schema.js";

export const handler = async (event: APIGatewayProxyEvent) => {
    const { errorResponse, data: body } = await Http.parseAndValidate(
        event,
        startSessionSchema,
    );
    if (errorResponse) return errorResponse;

    try {
        const sessionId = await startSessionLogic(body.userId);

        return Http.success(200, { sessionId });
    } catch (e) {
        return Http.error(e);
    }
};
