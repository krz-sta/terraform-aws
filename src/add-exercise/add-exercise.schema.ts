import { JSONSchemaType } from "ajv";

export interface AddExerciseRequest {
    userId: string;
    sessionId: string;
    exerciseName: string;
}

export const addExerciseSchema: JSONSchemaType<AddExerciseRequest> = {
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
