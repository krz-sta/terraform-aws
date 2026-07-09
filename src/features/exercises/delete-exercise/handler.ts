import { APIGatewayProxyEvent } from "aws-lambda";
import { Http } from "../../shared/helpers/http.helper.js";
import { deleteExerciseLogic } from "./delete-exercise.helper.js";
import { deleteExerciseSchema } from "./delete-exercise.schema.js";

export const handler = async (event: APIGatewayProxyEvent) => {
    const { errorResponse, data: body } = await Http.parseAndValidate(
        event,
        deleteExerciseSchema,
    );
    if (errorResponse) return errorResponse;

    try {
        await deleteExerciseLogic(
            body.userId,
            body.sessionId,
            body.exerciseName,
        );

        return Http.success(200, {
            message: "Exercise deleted successfully.",
        });
    } catch (e) {
        return Http.error(e);
    }
};
