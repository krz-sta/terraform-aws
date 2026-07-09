import { JSONSchemaType } from "ajv";
import { UpdateSetRequest } from "../../shared/types/requests.js";

export const updateSetSchema: JSONSchemaType<UpdateSetRequest> = {
    type: "object",
    properties: {
        userId: { type: "string", minLength: 1 },
        sessionId: { type: "string", minLength: 1 },
        exerciseName: { type: "string", minLength: 1 },
        setIndex: { type: "number", minimum: 0 },
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
    required: ["userId", "sessionId", "exerciseName", "setIndex", "setData"],
    additionalProperties: false,
};
