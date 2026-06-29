import { get } from "../services/db-client.service.js";

export const getSessionLogic = async (userId, sessionId) => {
    const session = await get(
        "UserId",
        userId,
        "SessionId",
        sessionId,
        "DBActiveSessions",
    );

    if (!session) {
        throw new Error("SESSION_NOT_FOUND");
    }

    return session;
};
