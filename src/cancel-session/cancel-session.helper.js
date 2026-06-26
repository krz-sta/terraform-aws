import { cancelSession } from "./cancel-session.service.js";

export const cancelSessionLogic = async (userId, sessionId) => {
    await cancelSession(userId, sessionId);
};
