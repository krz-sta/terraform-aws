import { update, get } from "../services/db-client.service.js";

export const addSetLogic = async (userId, sessionId, exerciseName, setData) => {
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
        updatedExercises[exerciseName] = { Sets: [] };
    }

    updatedExercises[exerciseName].Sets.push(setData);

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
