export const addSetSchema = {
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
