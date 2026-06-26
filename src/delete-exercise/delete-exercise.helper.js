import {
    getSessionByIds,
    updateSession,
} from "../services/active-session.service.js";

export const deleteExerciseLogic = async (event) => {
    const session = await getSessionByIds(event.userId, event.sessionId);

    if (!session) {
        throw new Error("SESSION_NOT_FOUND");
    }

    let updatedExercises = session.Exercises || {};

    if (!updatedExercises[event.exerciseName]) {
        throw new Error("EXERCISE_NOT_FOUND");
    }

    delete updatedExercises[event.exerciseName];

    await updateSession(event.userId, event.sessionId, updatedExercises);
};
