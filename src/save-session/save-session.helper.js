import { saveSession } from "./save-session.service.js";
import { getSessionByIds } from "../services/active-session.service.js";

export const saveSessionLogic = async (userId, sessionId) => {
    const session = await getSessionByIds(userId, sessionId);

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

    await saveSession(sessionHistoryItem);
};
