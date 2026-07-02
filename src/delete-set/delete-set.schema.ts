export const deleteSetSchema = {
    type: "object",
    properties: {
        userId: { type: "string", minLength: 1 },
        sessionId: { type: "string", minLength: 1 },
        exerciseName: { type: "string", minLength: 1 },
        setIndex: { type: "number", minimum: 0 },
    },
    required: ["userId", "sessionId", "exerciseName", "setIndex"],
    additionalProperties: false,
};
