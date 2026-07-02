export const deleteExerciseSchema = {
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
};
