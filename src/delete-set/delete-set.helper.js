import {
    updateSession,
    getSessionByIds,
} from "../services/active-session.service.js";

export const deleteSetLogic = async (
    userId,
    sessionId,
    exerciseName,
    setIndex,
) => {
    const session = await getSessionByIds(userId, sessionId);

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

    await updateSession(userId, sessionId, updatedExercises);
};
