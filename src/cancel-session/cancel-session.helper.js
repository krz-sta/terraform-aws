import { deleteCmd } from "../services/db-client.service.js";

export const cancelSessionLogic = async (userId, sessionId) => {
    await deleteCmd(
        "UserId",
        userId,
        "SessionId",
        sessionId,
        "DBActiveSessions",
    );
};
