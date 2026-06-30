import { update, get } from "../services/db-client.service.js";

const ACTIVE_SESSIONS_TABLE_NAME = process.env.ACTIVE_SESSIONS_TABLE_NAME;

export const deleteSetLogic = async (
    userId,
    sessionId,
    exerciseName,
    setIndex,
) => {
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

    if (
        !updatedExercises[exerciseName] ||
        !updatedExercises[exerciseName].Sets[setIndex]
    ) {
        throw new Error("SET_NOT_FOUND");
    }

    delete updatedExercises[exerciseName].Sets[setIndex];

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
