import { APIGatewayProxyEvent } from "aws-lambda";
import { Http } from "../helpers/http.helper.js";
import { deleteSetLogic } from "./delete-set.helper.js";
import { deleteSetSchema } from "./delete-set.schema.js";

export const handler = async (event: APIGatewayProxyEvent) => {
    const { errorResponse, data: body } = await Http.parseAndValidate(
        event,
        deleteSetSchema,
    );
    if (errorResponse) return errorResponse;

    try {
        await deleteSetLogic(
            body.userId,
            body.sessionId,
            body.exerciseName,
            body.setIndex,
        );

        return Http.success(200, {
            message: "Set deleted successfully.",
        });
    } catch (e) {
        return Http.error(e);
    }
};
