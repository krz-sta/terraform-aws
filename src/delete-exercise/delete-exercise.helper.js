import { get, update } from "../services/db-client.service.js";

const ACTIVE_SESSIONS_TABLE_NAME = process.env.ACTIVE_SESSIONS_TABLE_NAME;

export const deleteExerciseLogic = async (userId, sessionId, exerciseName) => {
    const session = await get(
        "UserId",
        userId,
        "SessionId",
        sessionId,
        ACTIVE_SESSIONS_TABLE_NAME,
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
        ACTIVE_SESSIONS_TABLE_NAME,
    );
};
