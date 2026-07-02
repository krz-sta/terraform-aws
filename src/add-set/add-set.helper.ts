import { update, get } from "../services/db-client.service.js";
import { SetData } from "../types/SetData.js"

const ACTIVE_SESSIONS_TABLE_NAME: string | undefined = process.env.ACTIVE_SESSIONS_TABLE_NAME;

if (!ACTIVE_SESSIONS_TABLE_NAME) {
    throw new Error("Missing environment variable.");
}

export const addSetLogic = async (userId: string, sessionId: string, exerciseName:string, setData: SetData) => {
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
