export const getStatsSchema = {
    type: "object",
    properties: {
        userId: { type: "string", minLength: 1 },
    },
    required: ["userId"],
    additionalProperties: false,
};
