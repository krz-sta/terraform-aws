import {
    getSessionByIds,
    updateSession,
} from "../services/active-session.service.js";

export const deleteExerciseLogic = async (userId, sessionId, exerciseName) => {
    const session = await getSessionByIds(userId, sessionId);

    if (!session) {
        throw new Error("SESSION_NOT_FOUND");
    }

    let updatedExercises = session.Exercises || {};

    if (!updatedExercises[exerciseName]) {
        throw new Error("EXERCISE_NOT_FOUND");
    }

    delete updatedExercises[exerciseName];

    await updateSession(userId, sessionId, updatedExercises);
};
