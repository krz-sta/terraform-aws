import { addExerciseLogic } from "./add-exercise.helper.js";
import { addExerciseSchema } from "./add-exercise.schema.js";
import { APIGatewayProxyEvent } from "aws-lambda";
import { Http } from "../../shared/helpers/http.helper.js";

export const handler = async (event: APIGatewayProxyEvent) => {
    const { errorResponse, data: body } = await Http.parseAndValidate(
        event,
        addExerciseSchema,
    );
    if (errorResponse) return errorResponse;

    try {
        await addExerciseLogic(body.userId, body.sessionId, body.exerciseName);

        return Http.success(200, {
            message: "Exercise added successfully.",
        });
    } catch (e) {
        return Http.error(e);
    }
};
