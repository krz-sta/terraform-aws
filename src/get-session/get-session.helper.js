import { getSessionByIds } from "./get-session.service.js";

export const getSessionLogic = async (userId, sessionId) => {
    const session = await getSessionByIds(userId, sessionId);

    if (!session) {
        throw new Error("SESSION_NOT_FOUND");
    }

    return session;
};
