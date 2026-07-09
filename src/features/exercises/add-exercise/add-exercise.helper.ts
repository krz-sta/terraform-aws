import {
    ConflictError,
    NotFoundError,
} from "../../shared/helpers/error.helper.js";
import { requireEnv } from "../../shared/helpers/env.helper.js";
import { get, update } from "../../shared/services/db-client.service.js";
import { ActiveSessionItem } from "../../shared/types/workout.js";

const ACTIVE_SESSIONS_TABLE_NAME = requireEnv("ACTIVE_SESSIONS_TABLE_NAME");

export async function addExerciseLogic(
    userId: string,
    sessionId: string,
    exerciseName: string,
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

    if (updatedExercises[exerciseName]) {
        throw new ConflictError("Exercise already exists in the session.");
    }

    updatedExercises[exerciseName] = { Sets: [] };
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
