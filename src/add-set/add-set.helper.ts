import { NotFoundError } from "../helpers/error.helper.js";
import { requireEnv } from "../helpers/env.helper.js";
import { update, get } from "../services/db-client.service.js";
import { ActiveSessionItem, SetInput } from "../types/workout.js";

const ACTIVE_SESSIONS_TABLE_NAME = requireEnv("ACTIVE_SESSIONS_TABLE_NAME");

export async function addSetLogic(
    userId: string,
    sessionId: string,
    exerciseName: string,
    setData: SetInput,
) {
    const session = await get<ActiveSessionItem>(
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

    const updatedExercises = session.Exercises || {};

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
