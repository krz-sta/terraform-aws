import { saveSession } from "./save-session.service.js";
import { requireEnv } from "../../shared/helpers/env.helper.js";
import { get } from "../../shared/services/db-client.service.js";
import { NotFoundError } from "../../shared/helpers/error.helper.js";
import {
    ActiveSessionItem,
    SessionHistoryItem,
} from "../../shared/types/workout.js";

const ACTIVE_SESSIONS_TABLE_NAME = requireEnv("ACTIVE_SESSIONS_TABLE_NAME");

export async function saveSessionLogic(userId: string, sessionId: string) {
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

    const endTime = new Date().toISOString();
    const sessionHistoryItem: SessionHistoryItem = {
        UserId: userId,
        SessionId: sessionId,
        Exercises: session.Exercises || {},
        StartTime: session.StartTime,
        EndTime: endTime,
        TimeToExist: Math.floor(Date.now() / 1000) + 30 * 24 * 3600,
    };

    console.log(`Saving session to history:`);
    console.log(sessionHistoryItem);

    await saveSession(sessionHistoryItem);
}
