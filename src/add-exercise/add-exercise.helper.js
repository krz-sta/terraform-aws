import { parseBody } from "../helpers/parse-body.helper.js";
import {
    getSessionByIds,
    updateSession,
} from "../services/active-session.service.js";

export const addExerciseLogic = async (userId, sessionId, exerciseName) => {
    const session = await getSessionByIds(userId, sessionId);

    if (!session) {
        throw new Error("SESSION_NOT_FOUND");
    }

    let updatedExercises = session.Exercises || {};

    if (updatedExercises[exerciseName]) {
        throw new Error("EXERCISE_ALREADY_EXISTS");
    }

    updatedExercises[exerciseName] = { Sets: [] };
    await updateSession(userId, sessionId, updatedExercises);
};
