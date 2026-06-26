import crypto from "crypto";
import { querySessionByUserId, startSession } from "./start-session.service.js";

export const startSessionLogic = async (userId) => {
    const existing = await querySessionByUserId(userId);
    if (existing) {
        const error = new Error("SESSION_ALREADY_EXISTS");
        error.existingSessionId = existing.SessionId;
        throw error;
    }

    const sessionId = crypto.randomUUID();
    const ttl = Date.now() / 1000 + 8 * 3600;

    await startSession(userId, sessionId, ttl);

    return sessionId;
};
