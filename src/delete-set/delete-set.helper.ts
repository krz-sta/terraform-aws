import { NotFoundError } from "../helpers/errors.js";
import { update, get } from "../services/db-client.service.js";

const ACTIVE_SESSIONS_TABLE_NAME = process.env.ACTIVE_SESSIONS_TABLE_NAME;

if (!ACTIVE_SESSIONS_TABLE_NAME) {
    throw new Error("Missing environment variable.");
}

export const deleteSetLogic = async (
    userId: string,
    sessionId: string,
    exerciseName: string,
    setIndex: number,
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

    if (
        !updatedExercises[exerciseName] ||
        !updatedExercises[exerciseName].Sets[setIndex]
    ) {
        throw new NotFoundError("Set not found.");
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
