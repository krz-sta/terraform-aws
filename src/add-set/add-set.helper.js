import {
    updateSession,
    getSessionByIds,
} from "../services/active-session.service.js";

export const addSetLogic = async (userId, sessionId, exerciseName, setData) => {
    const session = await getSessionByIds(userId, sessionId);

    if (!session) {
        throw new Error("SESSION_NOT_FOUND");
    }

    let updatedExercises = session.Exercises || {};

    if (!updatedExercises[exerciseName]) {
        updatedExercises[exerciseName] = { Sets: [] };
    }

    updatedExercises[exerciseName].Sets.push(setData);

    await updateSession(userId, sessionId, updatedExercises);
};
