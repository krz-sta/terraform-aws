import { APIGatewayProxyEvent } from "aws-lambda";
import { Http } from "../../shared/helpers/http.helper.js";
import { getStatsLogic } from "./get-stats.helper.js";
import { getStatsSchema } from "./get-stats.schema.js";

export const handler = async (event: APIGatewayProxyEvent) => {
    const { errorResponse, data: body } = await Http.parseAndValidate(
        event,
        getStatsSchema,
    );
    if (errorResponse) return errorResponse;

    try {
        const statsData = await getStatsLogic(body.userId);

        return Http.success(200, statsData);
    } catch (e) {
        return Http.error(e);
    }
};
