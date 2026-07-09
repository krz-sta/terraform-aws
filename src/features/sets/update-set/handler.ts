import { Http } from "../../shared/helpers/http.helper.js";
import { APIGatewayProxyEvent } from "aws-lambda";
import { updateSetLogic } from "./update-set.helper.js";
import { updateSetSchema } from "./update-set.schema.js";

export const handler = async (event: APIGatewayProxyEvent) => {
    const { errorResponse, data: body } = await Http.parseAndValidate(
        event,
        updateSetSchema,
    );
    if (errorResponse) return errorResponse;

    try {
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
    } catch (e) {
        return Http.error(e);
    }
};
