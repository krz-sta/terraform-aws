import { update, get } from "../services/db-client.service.js";

const ACTIVE_SESSIONS_TABLE_NAME = process.env.ACTIVE_SESSIONS_TABLE_NAME;

export const addSetLogic = async (userId, sessionId, exerciseName, setData) => {
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
        ACTIVE_SESSIONS_TABLE_NAME,
    );
};
