import { saveSession } from "./save-session.service.js";
import { get } from "../services/db-client.service.js";

const ACTIVE_SESSIONS_TABLE_NAME = process.env.ACTIVE_SESSIONS_TABLE_NAME;

export const saveSessionLogic = async (userId, sessionId) => {
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
