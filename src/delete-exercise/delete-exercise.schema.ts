import { JSONSchemaType } from "ajv";
import { DeleteExerciseRequest } from "../types/requests.js";

export const deleteExerciseSchema: JSONSchemaType<DeleteExerciseRequest> = {
    type: "object",
    properties: {
        userId: {
            type: "string",
            minLength: 1,
        },
        sessionId: {
            type: "string",
            minLength: 1,
        },
        exerciseName: {
            type: "string",
            minLength: 1,
        },
    },
    required: ["userId", "sessionId", "exerciseName"],
    additionalProperties: false,
};
