import { JSONSchemaType } from "ajv";

export interface AddSetRequest {
    userId: string;
    sessionId: string;
    exerciseName: string;
    setData: {
        weight: number;
        reps: number;
    };
}

export const addSetSchema: JSONSchemaType<AddSetRequest> = {
    type: "object",
    properties: {
        userId: { type: "string", minLength: 1 },
        sessionId: { type: "string", minLength: 1 },
        exerciseName: { type: "string", minLength: 1 },
        setData: {
            type: "object",
            properties: {
                weight: { type: "number", minimum: 0 },
                reps: { type: "number", minimum: 0 },
            },
            required: ["weight", "reps"],
            additionalProperties: false,
        },
    },
    required: ["userId", "sessionId", "exerciseName", "setData"],
    additionalProperties: false,
};
