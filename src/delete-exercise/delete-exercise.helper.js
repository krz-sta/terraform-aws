import { get, update } from "../services/db-client.service.js";

export const deleteExerciseLogic = async (userId, sessionId, exerciseName) => {
    const session = await get(
        "UserId",
        userId,
        "SessionId",
        sessionId,
        "DBActiveSessions",
    );

    if (!session) {
        throw new Error("SESSION_NOT_FOUND");
    }

    let updatedExercises = session.Exercises || {};

    if (!updatedExercises[exerciseName]) {
        throw new Error("EXERCISE_NOT_FOUND");
    }

    delete updatedExercises[exerciseName];

    await update(
        "UserId",
        userId,
        "SessionId",
        sessionId,
        "Exercises",
        updatedExercises,
        "DBActiveSessions",
    );
};
