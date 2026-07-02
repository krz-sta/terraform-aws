import { saveSession } from "./save-session.service.js";
import { get } from "../services/db-client.service.js";
import { NotFoundError } from "../helpers/errors.js";

const ACTIVE_SESSIONS_TABLE_NAME = process.env.ACTIVE_SESSIONS_TABLE_NAME;

if (!ACTIVE_SESSIONS_TABLE_NAME) {
    throw new Error("Missing environment variable.");
}

export const saveSessionLogic = async (userId: string, sessionId: string) => {
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

    const endTime = new Date().toISOString();
    const sessionHistoryItem = {
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
};
