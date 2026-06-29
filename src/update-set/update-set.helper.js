import { update, get } from "../services/db-client.service.js";

export const updateSetLogic = async (
    userId,
    sessionId,
    exerciseName,
    setIndex,
    setData,
) => {
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

    if (
        !updatedExercises[exerciseName] ||
        !updatedExercises[exerciseName].Sets[setIndex]
    ) {
        throw new Error("SET_NOT_FOUND");
    }

    updatedExercises[exerciseName].Sets[setIndex] = setData;

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
