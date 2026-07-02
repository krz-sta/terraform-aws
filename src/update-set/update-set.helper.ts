import { NotFoundError } from "../helpers/error.helper.js";
import { update, get } from "../services/db-client.service.js";

const ACTIVE_SESSIONS_TABLE_NAME = process.env.ACTIVE_SESSIONS_TABLE_NAME;

if (!ACTIVE_SESSIONS_TABLE_NAME) {
    throw new Error("Missing environment variable.");
}

export const updateSetLogic = async (
    userId: string,
    sessionId: string,
    exerciseName: string,
    setIndex: number,
    setData: any,
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

    updatedExercises[exerciseName].Sets[setIndex] = setData;

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
