import { NotFoundError } from "../helpers/error.helper.js";
import { requireEnv } from "../helpers/env.helper.js";
import { update, get } from "../services/db-client.service.js";
import { SetData } from "../types/SetData.js";

const ACTIVE_SESSIONS_TABLE_NAME = requireEnv("ACTIVE_SESSIONS_TABLE_NAME");

export async function addSetLogic(
    userId: string,
    sessionId: string,
    exerciseName: string,
    setData: SetData,
) {
    const session = await get(
        {
            pkName: "UserId",
            pk: userId,
            skName: "SessionId",
            sk: sessionId,
        },
        ACTIVE_SESSIONS_TABLE_NAME,
    );

    if (!session) {
        throw new NotFoundError("Session not found.");
    }

    let updatedExercises = session.Exercises || {};

    if (!updatedExercises[exerciseName]) {
        updatedExercises[exerciseName] = { Sets: [] };
    }

    updatedExercises[exerciseName].Sets.push(setData);

    await update(
        {
            pkName: "UserId",
            pk: userId,
            skName: "SessionId",
            sk: sessionId,
        },
        {
            Exercises: updatedExercises,
        },
        ACTIVE_SESSIONS_TABLE_NAME,
    );
}
