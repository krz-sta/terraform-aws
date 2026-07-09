import { NotFoundError } from "../helpers/error.helper.js";
import { requireEnv } from "../helpers/env.helper.js";
import { update, get } from "../services/db-client.service.js";
import { ActiveSessionItem } from "../types/workout.js";

const ACTIVE_SESSIONS_TABLE_NAME = requireEnv("ACTIVE_SESSIONS_TABLE_NAME");

export async function deleteSetLogic(
    userId: string,
    sessionId: string,
    exerciseName: string,
    setIndex: number,
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

    const exercise = updatedExercises[exerciseName];
    const sets = exercise?.Sets;

    if (!sets || setIndex < 0 || setIndex >= sets.length) {
        throw new NotFoundError("Set not found.");
    }

    sets.splice(setIndex, 1);

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
