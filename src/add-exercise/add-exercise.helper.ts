import { ConflictError, NotFoundError } from "../helpers/error.helper.js";
import { get, update } from "../services/db-client.service.js";

const ACTIVE_SESSIONS_TABLE_NAME: string | undefined =
    process.env.ACTIVE_SESSIONS_TABLE_NAME;

if (!ACTIVE_SESSIONS_TABLE_NAME) {
    throw new Error("Missing environment variable.");
}

export const addExerciseLogic = async (
    userId: string,
    sessionId: string,
    exerciseName: string,
) => {
    const session = await get(
        "UserId",
        userId,
        "SessionId",
        sessionId,
        ACTIVE_SESSIONS_TABLE_NAME,
    );

    if (!session) {
        throw new NotFoundError("Session not found.");
    }

    let updatedExercises = session.Exercises || {};

    if (updatedExercises[exerciseName]) {
        throw new ConflictError("Exercise already exists in the session.");
    }

    updatedExercises[exerciseName] = { Sets: [] };
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
